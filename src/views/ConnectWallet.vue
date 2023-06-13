<template>
  <div class="account-panel">
    <InterUnlockModal
      :afterUnlock="openGetWalletModal"
      :close="close"
      :visible="modal === 'unlock'"
    />
    <InterGetWalletModal :close="closeGetWalletModal" :afterGetWallet="afterGetWallet" :visible="modal== 'getWallet'"
                         :item="item"/>
    <el-button @click="close">关闭</el-button>
  </div>
</template>

<script>
import InterUnlockModal from '@/components/index/InterUnlockModal'
import InterGetWalletModal from '@/components/tx/InterGetWalletModal'
import {mapState} from 'vuex'

export default {
  name: 'ConnectWallet',
  props: ['view'],
  components: {
    InterGetWalletModal,
    InterUnlockModal
  },
  computed: mapState({
    address: 'address',
    balance: 'balance',
    locked: 'locked',
    usdBalance: 'usdBalance',
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

    if (!this.locked) {
      this.modal = 'getWallet'
    }
    else {
      this.modal = 'unlock'
    }
  },
  methods: {
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
      window.opener.postMessage({
        type: 'connectWallet', message: message
      }, this.callBack)
      window.close()
    },
    openGetWalletModal() {
      this.modal = 'getWallet'
    },
    close() {
      // 处理验证响应
      window.close()
    }
  }
}

</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__left,
.account-panel__right {
  @apply w-full;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7 w-full;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__balance h3 {
  @apply text-green mb-5;
}

.account-panel__balance h2 {
  @apply text-gray-300 text-md mb-0;
}

.account-panel__balance h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

#walletName {
  padding-left: 0;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

.account-panel__modals {
  width: 1px;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

  .account-panel__buttons.staking-buttons {
    @apply grid-cols-1;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__buttons.staking-buttons > button {
    width: 170px;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}
</style>
