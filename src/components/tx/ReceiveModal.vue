<template>
  <div>
    <Modal :close="cancel" :visible="visible">
      <template v-slot:header>
        <h2 class="mb-8">接收 CT<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-4 min-h-300">
          <div class="form-group mb-8">
            <label for="send1" class="flex items-center space-x-3 label">
              我接收资金的公开地址
            </label>
            <div class="wrapper flex">
              <figure class="qrcode">
                <VueQrcode
                  :value="address"
                  :options="{
                    margin: 1,
                    width: 200
                  }"
                />
                <img
                  class="qrcode__image"
                  src="assets/logo.svg"
                  alt="ct logo"
                >
              </figure>
              <span class="address">{{ address }}</span>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <Tooltip
              position="top" theme="dark"
              :text="'已复制到剪贴板'"
              :clickToDisplay="true"
              :display="displayTooltip"
            >
              <button @click="copy" class="w-full button button--success">复制</button>
            </Tooltip>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import {mapState} from 'vuex'
import Modal from '../Modal'
import Tooltip from '../Tooltip'

export default {
  name: 'ReceiveModal',
  data() {
    return {
      displayTooltip: false
    }
  },
  components: {
    Modal,
    Tooltip,
    VueQrcode
  },
  props: {
    close: Function,
    visible: Boolean
  },
  computed: {
    ...mapState(['address'])
  },
  async mounted() {
  },
  methods: {
    cancel() {
      this.displayTooltip = false
      this.close()
    },
    copy() {
      navigator.clipboard.writeText(this.address)
      this.displayTooltip = true
      setTimeout(() => {
        this.displayTooltip = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.convert-info :deep(.amount .currency) {
  @apply ml-5;
}

.amount.sub {
  @apply text-white text-3xl;
}

.amount.sub :deep(.currency) {
  @apply text-half bottom-0 ml-2;
}

.wrapper {
  @apply flex justify-around py-20 rounded-xl;
  background-color: black;
  background-image: url(../../../public/assets/receive-map.svg);
}

.address {
  font-size: 1.4rem;
  width: 150px;
  text-align: justify;
  align-self: center;
  overflow-wrap: break-word;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}

.qrcode {
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
  border: solid 10px;
  border-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.qrcode__image {
  background-color: #1d1d1d;
  border: 0.25rem solid #1d1d1d;
  border-radius: 100%;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.25);
  height: 25%;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
  padding: 3px;
}

@media only screen and (max-width: 500px) {
  .wrapper {
    @apply flex-col items-center
  }

  .address {
    @apply mt-14
  }
}
</style>
