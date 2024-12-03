<template>
  <v-app>
    <v-main>
      <v-drawer
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
      </v-drawer>
      <div class="md:hidden" v-if="active">
        <v-bottom-navigation :active="true" :elevation="8" color="primary" grow v-model="selected">
          <v-btn value="wallet" :to="item.path" v-for="(item,index ) in options" v-bind:key="index">
            <v-icon>{{ item.icon }}</v-icon>
            <span>{{ item.title }}</span>
          </v-btn>
        </v-bottom-navigation>
      </div>
      <router-view :key="$route.fullPath"/>
    </v-main>

  </v-app>
</template>

<script>
import {useDark, useToggle} from '@vueuse/core'
import WCRequestAccountModal from './components/modal/WCRequestAccountModal.vue'
import {mapState} from 'vuex'
import DappCallRequestModal from './components/web3Connect/DappCallRequest.vue'

import WalletConnect, {WCEvent} from './store/walletConnect'
// import {CurvedBottomNavigation} from 'bottom-navigation-vue'
// 在App.vue中
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
      selected: 0,
      active: false,
      options: [
        {
          id: 0,
          icon: 'mdi-wallet',
          title: '钱包',
          modelValue: 'overview',
          path: 'overview'
        },
        {
          id: 1,
          icon: 'mdi-newspaper',
          title: '资讯',
          modelValue: 'news',
          path: 'news'
        },
        {
          id: 2,
          icon: 'mdi-web',
          title: '发现',
          modelValue: 'discover',
          path: 'discover'
        },
        {
          id: 3,
          icon: 'mdi-semantic-web',
          title: 'Dapp',
          modelValue: 'dapp',
          path: 'dapp'
        }
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
    ...mapState(['address', 'showAlert', 'alertMessage', 'alertType'])
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
        this.active = true
        // 抽取 'name' 属性值
        if (newVal == null) {
          this.active = false
        }
        else {
          let tempUrl = newVal.substring(1)
          tempUrl = tempUrl.split('?')[0]
          const newStr = newVal.length > 0 ? tempUrl : newVal
          const paths = this.options.map(item => item.path)
          if (paths.includes(newStr)) {
            this.active = true
          }
          else {
            this.active = false
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
    showErrorMessage() {
      this.$message.error('这是一个错误信息!')
    },
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
    },
    toLink(item) {
      this.selected = item.id
      this.$router.push(item.path)
    }
  }
}
</script>

<style>
</style>
