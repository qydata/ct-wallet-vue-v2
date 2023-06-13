<template>
  <div>
    <Modal :close="cancel" :visible="visible">
      <template v-slot:header>
        <h2 class="mb-8">授权获取钱包地址<span class="testnet-header" v-if="isTestnet">(Testnet)</span>
        </h2>
        <div>
          <span class="sub-heading d-block text-gray text-caption">
<!--          <Amount :value="balance" currency="CT"/> 可用-->
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
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="rejectFun">拒接</button>
            <button class="w-full button button--success" @click="approveFun">批准</button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
/*global process*/

import * as validation from '@/utils/validation'
import {ClipboardCopyIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers} from '@vuelidate/validators'
import {mapState} from 'vuex'
import Modal from '../Modal'

export default {
  name: 'InterSendModal',
  components: {
    ClipboardCopyIcon,
    Modal
  },
  props: {
    close: Function,
    afterGetWallet: Function,
    visible: Boolean,
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
      step: 1,
      canCopy: !!navigator.clipboard,
      recipient: '',
      amount: '',
      memo: '',

      completedTx: null,
      submitError: '',
      gas: 0,
      loading: false
    }
  },
  validations() {
    let amountV = []
    if (this.item == null || this.item.type == 'CT') {
      amountV = [
        validation.required,
        ...validation.amount(this.balance, this.amountParsed)
      ]
    }
    else {
      amountV = [
        validation.required,
        ...validation.amount(this.item.balance, this.amountParsed)
      ]
    }

    return {
      recipient: [
        validation.required,
        validation.ctAddress
      ],
      amount: amountV,
      memo: [
        helpers.withMessage(
          // eslint-disable-next-line max-len
          'Memo is limited to 32 characters and should include only upper and lowercase letters, numbers, hyphens and spaces.',
          // v => v.length === 0 || memoRegexp.test(v)
          v => true
        )
      ],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce'])
  },
  watch: {},
  mounted() {

  },
  methods: {
    rejectFun() {
      this.afterGetWallet(0)
    },
    approveFun() {
      this.afterGetWallet(1, this.address)
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    cancel() {
      this.reset()
      switch (this.item.type) {
      case 'ERC-20':
        this.close('erc20')
        break
      case 'ERC-721':
      case 'ERC-1155':
        this.close('nft')
        break
      default:
        this.close()
        break
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.amount.sub {
  @apply text-white text-3xl;
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

.loading {
  width: 50px;
  height: 50px;
  position: relative;
}

.loading > span {
  position: absolute;
  width: 100%;
  height: 100%;
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
