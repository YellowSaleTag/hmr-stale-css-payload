'use strict'

global.$RefreshReg$ = () => {}
global.$RefreshSig$ = () => () => {}

import { default as memfs } from 'memfs'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { default as webpack } from 'webpack'
import { default as webpackConfig } from '../webpack.config'
import { default as webpackDevMiddleware } from 'webpack-dev-middleware'
import { default as webpackHotMiddleware } from 'webpack-hot-middleware'

const useHMR = (app) => {
  const compiler = webpack(webpackConfig)
  const memFS = memfs.createFsFromVolume(new memfs.Volume())

  const devMiddlewareInstance = webpackDevMiddleware(compiler, {
    outputFileSystem: memFS,
    serverSideRender: true
  })

  app.use(devMiddlewareInstance)
  app.use(webpackHotMiddleware(compiler, { path: `/dist/__webpack_hmr` }))

  app.use(async (req, res, next) => {
    devMiddlewareInstance.waitUntilValid(async () => {
      const memFSPaths = memFS.readdirSync('/', { recursive: true })

      let requestedFilePath

      if (req.path.endsWith('.map')) {

        requestedFilePath = memFSPaths.find((p) => p.endsWith(req.path))
        return res.send(memFS.readFileSync(requestedFilePath).toString())

      } else if (req.path === '/' || req.path.endsWith('index.html')) {

        const manifestPath = memFSPaths.find((p) => p.endsWith('library/manifest.json'))
        const manifest = JSON.parse(memFS.readFileSync(manifestPath).toString())
        const entryPath = manifest['main.js'].replace('./', '/')
        const entryPathForImportCacheBusting = memFSPaths.find((p) => p.endsWith(entryPath))

        const { App } = await import(entryPathForImportCacheBusting)

        const component = React.createElement(
          'div',
          { id: 'root' },
          React.createElement(App, null)
        )

        requestedFilePath = memFSPaths.find((p) => p.endsWith('browser/index.html'))

        let html = memFS.readFileSync(requestedFilePath).toString()
        const appHtml = renderToString(component)
        html = html.replace('${root}', appHtml)

        return res.send(html)
      } else {
        return next()
      }
    })
  })
}

export const devHotReload = {
  useHMR
}
