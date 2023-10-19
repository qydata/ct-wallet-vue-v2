<template>
  <div class="account-panel">
    <InterSendModal :close="closeSendModal" :visible="modal== 'interSend'" :item="transaction"
                    :afterSendFun="afterSendFun"/>
<!--    <p>{{transaction}}</p>-->
  </div>
</template>

<script>
import InterSendModal from '@/components/tx/InterSendModal'
import {mapState} from 'vuex'
import { EventBus } from '@/utils/event-bus'
export default {
  name: 'Interact',
  props: ['view'],
  components: {
    InterSendModal
  },
  computed: mapState(['address', 'balance', 'usdBalance']),
  data() {
    return {
      modal: 'interSend',
      tabindex: '0',
      walletName: '',
      canCopy: !!navigator.clipboard,
      order: {},
      transaction: {}
    }
  },
  watch: {},
  mounted() {
    this.sessionId = this.$route.query.sessionId
    this.callBack = this.$route.query.callBack
    let that = this
    window.addEventListener('message', () => {
      let origin = event.origin
      // 通常，onmessage()事件处理程序应当首先检测其中的origin属性，忽略来自未知源的消息
      if (origin !== this.callBack) return
      // ...
      console.log('event.data', event.data)
      if (event.data && event.data.type == 'transaction') {
        console.log(event.data.message)
        that.transaction = event.data.message
        that.modal = 'interSend'
        that.processTrans()
      }
    }, false)
  },
  methods: {
    afterSendFun(type, result, tType) {
      console.log('type', type)
      console.log('tType', tType)
      console.log('result', result)

      let type1
      if (tType == 1) {
        type1 = 'trans_result_address'
      }
      else if (tType == 2) {
        type1 = 'trans_result_contract'
      }
      window.parent.postMessage({
        type: type1,
        code: type,
        message: result.message,
        result: JSON.parse(JSON.stringify(result.result))
      }, this.callBack)
      if (type != 0) {
        window.close()
      }

    },
    processTrans() {
      console.log(this.transaction)
    },
    closeSendModal(err) {
      let type1
      let tType = this.transaction.type
      if (tType == 1) {
        type1 = 'trans_result_address'
      }
      else if (tType == 2) {
        type1 = 'trans_result_contract'
      }
      window.parent.postMessage({
        type: type1,
        code: 0,
        message: '关闭弹框, 用户拒绝处理交易',
        result: err
      }, this.callBack)
      window.close()
    },
    close() {
      // 处理验证响应
      window.close()
    }
  },
  beforeDestroy() {
    EventBus.$off('onNetErr')
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
