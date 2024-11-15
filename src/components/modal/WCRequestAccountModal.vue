<template>
  <div>

    <ModalInter :close="cancel" :visible="success">
      <template v-slot:header>
        <h2 class="mb-8">授权获取钱包地址<span class="testnet-header" v-if="isTestnet">(Testnet)</span>
        </h2>
        <div>
          <span class="sub-heading d-block text-gray text-caption">
          </span>
        </div>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310">

          <div class="form-group">
            <label>钱包地址</label>
            <span class="flex items-center">
            <span class="font-mono break-all text-sm2">{{ address }}</span>

            <button
              class="flex-shrink-0 w-24 ml-24 text-green on-clicked-effect"
              v-if="canCopy"
              @click="copyToClipboard(address)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>

          </div>
          <div class="form-group">
            <label>钱包连接地址</label>
            <span class="flex items-center">
            <el-input size="large"
                      class="font-mono break-all text-sm2"
                      v-model="wcCopyPasteLink"
                      placeholder="输入 dApp URI"></el-input>
          </span>
          </div>

        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-2">
            <el-button size="large" type="primary" plain @click="rejectFun">拒接</el-button>
            <el-button size="large" type="primary" @click="beginHandshake">连接 dApp
            </el-button>
          </div>
        </div>
      </template>
    </ModalInter>
  </div>
</template>

<script>
import {ClipboardCopyIcon} from '@heroicons/vue/outline'
import ModalInter from '../ModalInter'
// Vue Components
import {mapState} from 'vuex'

export default {
  name: 'InterSendModal',
  components: {
    ClipboardCopyIcon,
    ModalInter
  },
  props: {
    close: Function,
    displayUri: String,
    onSuccess: Function,
    onReject: Function,

    item: {
      type: Object,
      default: () => ({
        type: 'CT',
        balance: 0
      })
    }
  },
  data() {
    return {
      canCopy: !!navigator.clipboard,
      success: true,
      wcCopyPasteLink: ''
    }
  },
  validations() {
    return {}
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce', 'wcConnectorSession']),
    walletConnectConnected() {
      return !!(this.wcConnectorSession && (this.wcConnectorSession.connected || this.wcConnectorSession.sessionData))
    }
  },
  watch: {},
  mounted() {
    if (this.displayUri != '') {
      this.wcCopyPasteLink = this.displayUri
      this.beginHandshake()
    }
  },
  methods: {
    resetWeb3ConnectionPage() {
      this.wcCopyPasteLink = ''
    },

    async initPairing() {
      try {
        await this.$store.dispatch('web3Connections/walletConnectPair', {
          uri: this.wcCopyPasteLink
        })
      } catch (err) {
        this.$message.error(err.message, 'Error Pairing')
      } finally {
        this.resetWeb3ConnectionPage()
      }
    },
    beginHandshake() {
      if (!this.wcCopyPasteLink)
        return this.$message.error(
          'No uri provided to connect with dApp.',
          'Cannot connect'
        )
      this.initPairing()
    },
    rejectFun() {
      this.onReject()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    cancel() {
      this.reset()
    }
  }
}
</script>

<style scoped>
.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.amount.sub :deep(.currency) {
  @apply text-half bottom-0 ml-2;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}

body {
  padding: 0;
  margin: 0;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading > span {
  position: absolute;
  width: 100%;
  height: 50%;
  transform: rotate(calc(var(--i) * 18deg));
}

.loading > span::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff;
  animation: breath 2s linear infinite;
  animation-delay: calc(var(--i) * 0.1s);
}

@keyframes breath {
  0% {
    transform: scale(0);
  }
  10% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(0);
  }
}
</style>
