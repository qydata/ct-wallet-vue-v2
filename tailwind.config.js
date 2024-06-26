// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  purge: [],
  darkMode: "class",
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  corePlugins: {
    container: false
  },
  plugins: [
   require('./src/tailwind')
  ]
}
