// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/
import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import titleMixin from './mixins/titleMixin'
import router from './router'
import Store from './store'
import './utils'
// import 'element-plus/lib/theme-chalk/index.css'

const WALLET_REFRESH_INTERVAL = 30 * 1000
const init = async () => {
  const store = await Store.init()

  const app = createApp(App, {store})
    .use(router)
    .use(store)
    .mixin(titleMixin)
    .mixin({
      data() {
        return {
          isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
        }
      }
    })
    .mount('#app')

  app.$router.beforeResolve(to => {
    if (store.state.locked && to.name !== 'Index') return {name: 'Index'}
    return true
  })

  if (store.state.address) store.dispatch('refresh')
  setInterval(() => store.dispatch('backgroundRefresh', app.$router), WALLET_REFRESH_INTERVAL)
}

init()
