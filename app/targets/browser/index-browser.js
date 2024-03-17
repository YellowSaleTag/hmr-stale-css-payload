'use strict'

import { App } from '../../components/app/App'
import { hydrateRoot } from 'react-dom/client'
import React from 'react'

const domRoot = document.getElementById('root')

hydrateRoot(
  domRoot,
  <App />
)
