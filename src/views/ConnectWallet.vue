<template>
  <div>
    <InterUnlockModal
      :afterUnlock="openGetWalletModal"
      :close="close"
      :visible="true" v-if="modal === 'unlock'"
    />
    <InterGetWalletModal :close="closeGetWalletModal"
                         :afterGetWallet="afterGetWallet"
                         :visible="true" v-if="modal== 'getWallet'"
                         :item="item"/>

  </div>
</template>

<script>
import InterUnlockModal from '@/components/index/InterUnlockModal'
import InterGetWalletModal from '@/components/tx/InterGetWalletModal'
import {mapState} from 'vuex'
import CreateModal from '@/components/index/CreateModal'
export default {
  name: 'ConnectWallet',
  props: ['view'],
  components: {
    InterGetWalletModal,
    CreateModal,
    InterUnlockModal
  },
  computed: mapState({
    address: 'address',
    balance: 'balance',
    locked: 'locked',
    cnyBalance: 'cnyBalance',
    hasWallet: state => state.address.length > 0
  }),

  data() {
    return {
      modal: 'getWallet',
      tabindex: '0',
      walletName: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {},
      transaction: {}
      // item: null
    }
  },
  watch: {},
  mounted() {
    this.sessionId = this.$route.query.sessionId
    this.callBack = this.$route.query.callBack

    if (this.hasWallet) {
      this.modal = 'getWallet'
    }
    else {
      sessionStorage.setItem('callbackURL', window.location.href)
      sessionStorage.setItem('callBack', this.callBack)
      sessionStorage.setItem('sessionId',this.sessionId)
      this.$router.push('/')
    }
  },
  methods: {
    gotoOverview() {
      if (window.location.href.indexOf('connectWallet') == -1) {
        this.$router.push('overview')
      }
      else {
        this.$router.push('getWallet')
      }
    },
    closeGetWalletModal() {
      this.modal = ''
    },
    afterGetWallet(type, result) {
      console.log('type', type)
      console.log('result', result)
      if (!this.hasWallet) {
        type = 2
      }
      let message
      switch (type) {

      case 0:
        message = {
          code: 1,
          message: '用户拒绝, 获取账户失败'
        }
        break
      case 1:
        message = {
          code: 2,
          message: '用户授权获取钱包地址',
          result: result
        }
        break
      case 2:
      default:
        message = {
          code: 0,
          message: '不存在钱包,请前往创建'
        }
        break
      }
      window.parent.postMessage({
        type: 'connectWallet', message: message
      }, this.callBack)
    },
    openGetWalletModal() {
      // TODO 获取支付信息

      this.modal = 'getWallet'
    }
  }
}

</script>

<style scoped>
</style>
