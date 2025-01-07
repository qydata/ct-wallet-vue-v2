<template>
  <div class="account-panel">
    <InterSendModal :close="closeSendModal" :visible="true" v-if="modal== 'interSend'" :item="transaction"
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
  computed: mapState(['address', 'balance', 'cnyBalance']),
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
    const that = this
    window.addEventListener('message', () => {
      const origin = event.origin
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
      const tType = this.transaction.type
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
</style>
