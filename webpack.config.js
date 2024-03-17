'use strict'

import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import { default as ReactFreshBabelPlugin } from 'react-refresh/babel'
import { default as ReactRefreshPlugin } from '@pmmmwh/react-refresh-webpack-plugin'
import { default as webpack } from 'webpack'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const devtool = 'source-map'
const publicPath = '/dist'
const webpackMode = 'development'

const rules = {
  css: () => ({
    test: /\.(css)$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1, // https://webpack.js.org/loaders/css-loader/#importloaders
          modules: {
            localIdentName: '[hash:8]'
          }
        }
      }
    ]
  }),
  react: () => ({
    test: /\.(js)$/,
    resolve: {
      fullySpecified: false
    },
    use: [{
      loader: 'babel-loader',
      options: {
        plugins: [ReactFreshBabelPlugin],
        presets: ['@babel/preset-env', '@babel/preset-react']
      }
    }]
  })
}

export default [
  {
    name: 'browser-build',
    mode: webpackMode,
    devtool,
    context: __dirname,
    entry: [
      `webpack-hot-middleware/client?name=browser-build&path=${publicPath}/__webpack_hmr`,
      './app/targets/browser/index-browser.js'
    ],
    output: {
      chunkFilename: '[name].[contenthash].js',
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist', 'browser'),
      publicPath
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    module: {
      rules: [rules.css(), rules.react()]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        inject: false,
        template: path.resolve(__dirname, 'app', 'targets', 'browser', 'index-browser.html')
      }),
      new MiniCssExtractPlugin({
        chunkFilename: '[name].[id].css',
        filename: '[name].css'
      }),
      new ReactRefreshPlugin({
        overlay: {
          sockIntegration: 'whm'
        }
      }),
      new WebpackManifestPlugin({
        publicPath: `./dist/browser`
      })
    ]
  },
  {
    name: 'library-build',
    mode: webpackMode,
    devtool,
    context: __dirname,
    entry: ['./app/targets/library/index-esm.js'],
    output: {
      assetModuleFilename: '[name].[contenthash][ext]',
      filename: '[name].[contenthash].js',
      globalObject: 'globalThis',
      library: {
        type: 'module'
      },
      path: path.resolve(__dirname, 'dist', 'library'),
      publicPath
    },
    module: {
      rules: [rules.css(), rules.react()]
    },
    plugins: [
      new MiniCssExtractPlugin({
        chunkFilename: '[name].[id].css',
        filename: '[name].css'
      }),
      new WebpackManifestPlugin({
        publicPath: `./dist/library`
      })
    ],
    externals: {
      react: 'react',
      'react-dom': 'react-dom'
    },
    experiments: {
      outputModule: true
    }
  }
]
