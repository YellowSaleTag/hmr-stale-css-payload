'use strict'

import { default as express } from 'express'

const app = express()

const { devHotReload } = await import('./dev-hot-reload')
devHotReload.useHMR(app)

const port = 3000

app.listen(port, () => {
  console.log(`Server running on :${port}`)
})
