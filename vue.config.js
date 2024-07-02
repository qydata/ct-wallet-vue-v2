// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

module.exports = {
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  assetsDir: 'assets/',
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        // This sets the pre-render title (see also src/mixins/titleMixing.js)
        args[0].title = process.env.VUE_APP_IS_TESTNET === 'true' ? 'Testnet (CT) Wallet' : '数字钱包'
        return args
      })
      // 移除 prefetch 插件
      config.plugins.delete('prefetch')
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      '/api': {
        // target: 'https://wallet.ctblock.cn',
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/ct-server-php'
        }
      },
      '/blockChain': {
        target: 'https://wallet.ctblock.cn/api/blockChain',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/blockChain': ''
        }
      }
    }
  }
}
