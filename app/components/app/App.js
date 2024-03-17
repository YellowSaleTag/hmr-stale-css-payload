'use strict'

import css from './app.css'
import React from 'react'

export const App = () => {
  return (
    <div className={css.container}>
      <p>hello, <span className={css.world}>world!</span></p>
    </div>
  )
}
