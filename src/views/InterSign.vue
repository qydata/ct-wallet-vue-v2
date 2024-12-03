<template>
  <div class="account-panel">
    <InterSignModal
      :visible="true" v-if="modal== 'interSend'"
      :transaction="transaction"
      :afterSignFun="afterSignFun"/>
  </div>
</template>

<script>
import InterSignModal from '@/components/tx/InterSignModal'
import {mapState} from 'vuex'
import { EventBus } from '@/utils/event-bus'
export default {
  name: 'InterSign',
  props: ['view'],
  components: {
    InterSignModal
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
    // 发送加载完成事件
  },
  methods: {
    afterSignFun(type, result, tType) {
      console.log('type', type)
      console.log('result', result)

      let type1
      if (tType == 1) {
        type1 = 'sign_transaction'
      }
      else if (tType == 2) {
        type1 = 'sign_stract_msg'
      }
      window.parent.postMessage({
        type: type1,
        code: type,
        message: result.message,
        result: JSON.parse(JSON.stringify(result.result))
      }, this.callBack)
    },
    processTrans() {
      console.log(this.transaction)
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
