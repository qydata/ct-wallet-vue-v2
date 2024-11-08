<template>
  <div id="app" class="app">

    <el-drawer
      title="Tool Wallet"
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
    <router-view :key="$route.fullPath"/>

  </div>
</template>

<script>
const ethers = require('ethers')
import {useDark, useToggle} from '@vueuse/core'
import WCRequestAccountModal from './components/modal/WCRequestAccountModal.vue'
import {mapState} from 'vuex'
import DappCallRequestModal from './components/web3Connect/DappCallRequest.vue'

import WalletConnect, {WCEvent} from './store/walletConnect'

export default {
  components: {
    DappCallRequestModal,
    WCRequestAccountModal
  },
  title() {
    return '草田链'
  },
  data() {
    return {
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
    address(oldVal, newVal) {
      if (newVal) {
        let that = this
        const dispatch = this.$store.dispatch
        dispatch('web3Connections/walletConnectInit', {
          modal: {
            show: that.showModal,
            hide: that.hideModal
          }
        })
      }
    }
  },
  mounted: function () {
    useToggle(useDark())
    // 强制应用黑夜模式
    this.setDarkMode()
    this.setViewHeight()
    window.addEventListener('resize', () => {
      this.setViewHeight()
    })
    this.blockEvemt()

    // 交易
    WalletConnect.on(WCEvent.RequestAccount, this.handleRequestAccount)

    // 父窗口接收来自子 iframe 的信息
    window.addEventListener('message', (event) => this.handleEvent(event))

    let that = this
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
  unmounted: function () {
    WalletConnect.removeListener(WCEvent.RequestAccount, this.handleRequestAccount)
    window.removeEventListener('message', this.handleEvent)

  },
  methods: {
    handleEvent(event) {
      if (event.data && event.data.type === 'display_uri') {
        console.log('Event triggered', event.data)
        let display_uri = event.data.data
        this.displayUri = display_uri
        this.handleRequestAccount()
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
    },
    blockEvemt() {
      let customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      customHttpProvider.on('block', (blockNumber) => {
        window.localStorage.setItem('blockNumber', blockNumber)
      })
    },
    setViewHeight: function () {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
  }
}
</script>

<style>
.app {
  @apply bg-gray-200 h-screen;
}
</style>
