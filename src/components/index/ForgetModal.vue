<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>忘记钱包</h2>
    </template>

    <template v-slot:body>
      <p>这将从该浏览器中删除您的钱包。</p>
      <p>请确保您已备份您的私钥，否则您可能会丢失钱包中的所有资金。</p>
    </template>

    <template v-slot:footer>
      <!-- eslint-disable-next-line max-len -->
      <div class="grid grid-cols-1 gap-24 px-24 pt-24 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-24">
        <button class="w-full button button--outline-success" @click="cancel">返回</button>
        <!-- eslint-disable-next-line max-len -->
        <button class="w-full button button--success border-red-600 bg-red-600 hover:border-red-800 hover:bg-red-800" @click="forget">忘记钱包</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal.vue'

export default {
  name: 'ForgetWallet',
  components: {
    Modal
  },
  props: {
    close: Function,
    afterForget: Function,
    visible: Boolean
  },
  methods: {
    cancel() {
      this.close()
    },
    async forget() {
      this.$store.dispatch('forget')
      this.afterForget()
    }
  }
}
</script>
