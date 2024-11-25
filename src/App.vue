<template>
  <div id="app" class="app">

    <el-drawer
      title="ToolWallet"
      v-model="drawer"
      size="60%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :direction="direction"
      :before-close="handleClose">
      <WCRequestAccountModal
        v-if="modal === WCEvent.RequestAccount"
        :displayUri="displayUri"
        :onSuccess="handleSuccess"
        :onReject="handleReject"
      />
      <DappCallRequestModal
        v-if="modal === 'dappCallRequestModal'"
        :request="dappRequest"
        :fmodal="{hide: hideModal}"
        :connector="dappConnector"
      />
    </el-drawer>

    <div v-show="showBN" class="block md:hidden">
      <WindowsBottomNavigation :options="options" v-model="selected"
                               background-color='#FFFFFF'
                               border-color='#000000'
                               badge-color='#828282'
      ></WindowsBottomNavigation>
    </div>
    <router-view :key="$route.fullPath"/>

  </div>
</template>

<script>
import {useDark, useToggle} from '@vueuse/core'
import WCRequestAccountModal from './components/modal/WCRequestAccountModal.vue'
import {mapState} from 'vuex'
import DappCallRequestModal from './components/web3Connect/DappCallRequest.vue'

import WalletConnect, {WCEvent} from './store/walletConnect'
// import {CurvedBottomNavigation} from 'bottom-navigation-vue'

export default {
  components: {
    DappCallRequestModal,
    WCRequestAccountModal
    // CurvedBottomNavigation
  },
  title() {
    return '草田链'
  },
  data() {
    return {
      selected: 1,
      showBN: false,
      options: [
        {
          id: 1,
          icon: 'fa fa-home',
          title: '总览',
          modelValue: 'overview',
          path: 'overview',
          replaceRoute: true
        },
        {
          id: 2,
          icon: 'fa fa-life-ring',
          title: '通证',
          modelValue: 'display',
          path: 'display',
          replaceRoute: true
        },
        {
          id: 3,
          icon: 'fa fa-television',
          title: '公示',
          modelValue: 'publicity',
          path: 'publicity',
          replaceRoute: true
        },
        {
          id: 4,
          icon: 'fa fa-bandcamp',
          title: 'Dapp',
          modelValue: 'dapp',
          path: 'dapp',
          replaceRoute: true
        }
        // {
        //   id: 5,
        //   icon: 'fa fa-cog',
        //   title: '其它',
        //   childs: [
        //     {id: 501, icon: 'fa fa-cog', title: '导出私钥'},
        //     {id: 502, icon: 'fa fa-cog', title: '实名'},
        //     {id: 503, icon: 'fa fa-cog', title: 'dApp 会话'},
        //     {id: 504, icon: 'fa fa-cog', title: '新建账户'},
        //     {id: 505, icon: 'fa fa-cog', title: '导入账户'},
        //     {id: 506, icon: 'fa fa-cog', title: '我的支付'},
        //     {id: 507, icon: 'fa fa-cog', title: '锁定钱包'}
        //   ]
        // }
      ],
      modal: '',
      displayUri: '',
      event: {},
      WCEvent: WCEvent,
      onSuccess: () => {
        console.log('not impl')
      },
      onReject: () => {
        console.log('not impl')
      },
      drawer: false,
      direction: 'btt',
      dappConnector: null,
      dappRequest: null
    }
  },
  computed: {
    ...mapState(['address'])
  },
  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        const that = this
        const dispatch = this.$store.dispatch
        dispatch('web3Connections/walletConnectInit', {
          modal: {
            show: that.showModal,
            hide: that.hideModal
          }
        })
      }
    },
    selected(newVal, oldVal) {
      console.log('selected:', oldVal, newVal)
    },
    '$route.fullPath': {
      handler: function (newVal, oldVal) {
        console.log(`fullPath changed from ${oldVal} to ${newVal}`)
        // 当 iframeSrc 改变时，执行一些操作
        this.showBN = true
        // 抽取 'name' 属性值
        const paths = this.options.map(item => item.path)
        if (newVal == null) {
          this.showBN = false
        }
        else {
          const newStr = newVal.length > 0 ? newVal.substring(1) : newVal
          if (paths.includes(newStr)) {
            this.showBN = true
          }
          else {
            this.showBN = false
          }
        }

        this.options.forEach(item => {
          console.log('/' + item.path === newVal)
          if ('/' + item.path === newVal) {
            this.selected = item.id
          }
        })

      }
    }
  },
  mounted() {
    useToggle(useDark())
    // 强制应用黑夜模式
    this.setDarkMode()

    // 交易
    WalletConnect.on(WCEvent.RequestAccount, this.handleRequestAccount)

    // 父窗口接收来自子 iframe 的信息
    window.addEventListener('message', (event) => this.handleEvent(event))

    const that = this
    if (this.address) {
      // this.initializeWallet(this.address)
      const dispatch = this.$store.dispatch
      dispatch('web3Connections/walletConnectInit', {
        modal: {
          show: that.showModal,
          hide: that.hideModal
        }
      })
    }
  },
  // 返回清理函数
  unmounted() {
    WalletConnect.removeListener(WCEvent.RequestAccount, this.handleRequestAccount)
    window.removeEventListener('message', this.handleEvent)
  },
  methods: {
    async handleEvent(event) {
      if (event.data && event.data.type === 'display_uri') {
        console.log('Event triggered', event.data)
        const display_uri = event.data.data
        console.log(display_uri)
        this.displayUri = display_uri
        // this.handleRequestAccount()
        this.drawer = true
        await this.$store.dispatch('web3Connections/walletConnectPair', {
          uri: display_uri
        })
      }
    },
    showModal(name, {
      request,
      connector
    }) {
      console.log('request:', request)

      this.dappRequest = request
      this.dappConnector = connector
      // this.modal = name
      this.modal = 'dappCallRequestModal'
      this.drawer = true
    },

    hideModal(name) {
      console.log('hide name', name)
      this.modal = ''
      this.drawer = false
    },
    handleClose(result) {
      this.onReject(result)
      this.modal = ''
      this.drawer = false
    },
    handleSuccess(result) {
      this.onSuccess(result)
      console.log('Success callback')
      // 关闭 Modal
      this.modal = ''
      this.drawer = false
      this.$message.success('签名成功')
    },
    handleReject() {
      this.onReject()
      console.log('Reject callback')
      // 关闭 Modal
      this.modal = ''
      this.drawer = false
    },
    handleRequestAccount() {
      this.modal = WCEvent.RequestAccount
      this.drawer = true
    },
    setDarkMode() {
      document.body.classList.add('dark-mode')
    },
    toggleTheme() {
      document.body.classList.toggle('dark-mode')
    }
  }
}
</script>

<style>
.app {
  @apply bg-gray-200 h-screen;
}
</style>
