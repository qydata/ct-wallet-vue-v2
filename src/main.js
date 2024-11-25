// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

// 统一导入el-icon图标
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/css/css-vars.css'
import './index.css'
// main.ts
// if you just want to import css
// import 'element-plus/theme-chalk/dark/css-vars.css'
/*global process*/
import {createApp} from 'vue'
import VueCookies from 'vue-cookies'
// import VModal from 'vue-js-modal'
// import 'element-plus/lib/theme-chalk/index.css'
import App from './App.vue'

import titleMixin from './mixins/titleMixin'
import router from './router'
import Store from './store'

import './utils'
// Vue.prototype.$message = ElementPlus.Message
const WALLET_REFRESH_INTERVAL = 30 * 1000
import bottomNavigationVue from 'bottom-navigation-vue'
import 'bottom-navigation-vue/dist/style.css'
import 'font-awesome/css/font-awesome.css'

const init = async () => {
  const store = await Store.init()
  const app = createApp(App, {store}).use(router)
    .use(store)
    // .use(VModal, {
    //   dialog: true,
    //   dynamicDefaults: {
    //     draggable: true
    //   }
    // })
    .use(VueCookies)
    .use(bottomNavigationVue)
    .use(ElementPlus)
    .mixin(titleMixin)
    .mixin({
      data() {
        return {
          isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
        }
      }
    })
    .mount('#app')


  app.$router.beforeResolve((to) => {
    // 如果钱包是锁定状态，直接重定向到首页
    if (store.state.locked && to.name !== 'Index') {
      // 记录要访问的地址
      sessionStorage.setItem('RE_HREF', window.location.pathname)
      sessionStorage.setItem('RE_HREF_S', window.location.search)
      return {name: 'Index'}
    }

    else {
      return true
    }
  })

  if (store.state.address) store.dispatch('refresh')
  setInterval(() => store.dispatch('backgroundRefresh', app.$router), WALLET_REFRESH_INTERVAL)
}

init()
