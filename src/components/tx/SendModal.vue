<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">发送 {{ item.name + '(' + item.symbol + ')' }}<span class="testnet-header" v-if="isTestnet">(Testnet)</span>
        </h2>
        <div>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance" currency="CT"/> 可用
          </span>
        </div>
        <div v-if="item.type != 'CT'">
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="formattedAmount" :currency="item.name+'('+item.symbol+')'"/> 可用
        </span>
        </div>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310">
          <div class="form-group" :class="{'form-group__error': v$.recipient.$error}">
            <label for="send-send" class="label">发送到</label>
            <input
              id="send-send"
              placeholder="CT 地址"
              ref="recipient"
              type="text"
              v-model="v$.recipient.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.recipient.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.memo.$error}" v-show="false">
            <label for="memo" class="label">备忘录 (可选)</label>
            <input type="text" placeholder="输入一个备忘录" id="memo" v-model="v$.memo.$model"/>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.memo.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div
            class="lg-input-group"
            :class="{'form-group__error': v$.amount.$error}"
          >
            <label for="amount-send">数量</label>
            <div class="relative input-wrap">
              <input
                type="number"
                id="amount-send"
                placeholder="0.00"
                v-model="v$.amount.$model"
                class="placeholder-white placeholder-opacity-100"
              />
              <span class="absolute right-0 text-xl currentColor top-23">{{ item.type }}</span>
              <!-- eslint-disable-next-line max-len -->
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors"
                   :key="error.$uid">{{ error.$message }}
              </div>
            </div>
          </div>
          <div class="flex flex-wrap pt-12 radio-list">
            <!-- eslint-disable-next-line max-len -->
            <Radio name="amount-send1" id="max" label="最大值" :selected="isMaxAmountEntered"
                   @click="setAmountAsPercent(100)"/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <button class="w-full button button--success" :disabled="!canReadySend" @click="readySend">发送</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">发送 {{ item.name + '(' + item.symbol + ')' }}<span class="testnet-header" v-if="isTestnet">(Testnet)</span>
        </h2>
        <div>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance" currency="CT"/> 可用
        </span>
        </div>
        <div v-if="item.type != 'CT'">
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="formattedAmount" :currency="item.name+'('+item.symbol+')'"/> 可用
        </span>
        </div>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310">
          <div class="form-group mb-14">
            <label class="label">发送到</label>
            <HashLink to="explorer" :wallet="recipient"/>
          </div>
          <div class="form-group mb-14 text-xl" v-show="false">
            <label class="label">备忘录</label>
            <span class="break-all">{{ memo || 'None' }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>数量</label>
            <Amount :value="amountParsed" :currency="item.name+'('+item.symbol+')'" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>手续费</label>
            <Amount :value="gas" currency="CT" short sub/>
          </div>
          <div class="mb-0 form-group">
            <label>接收人收到</label>
            <Amount :value="amountParsedCalc" :currency="item.name+'('+item.symbol+')'" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group"
                 :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
              <label for="pass-step">输入密码</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  type="password"
                  autocomplete="off"
                  @keypress="sendOnEnter"
                  placeholder="你的密码"
                  id="pass-step"
                  v-model="v$.password.$model"
                />
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">
                {{ passwordError }}
              </div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="() => goto(1)">返回</button>
            <button
              :disabled="!canSend"
              @click="send"
              class="w-full button button--success"
            >确认交易
            </button>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div v-if="submitError"
               class="px-20 py-20 my-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ submitError }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">交易已发送<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <div class="form-group mb-14">
            <label class="label">接收人</label>
            <HashLink to="explorer" :wallet="recipient"/>
          </div>
          <div class="form-group mb-14 text-xl" v-show="false">
            <label class="label">备忘录</label>
            <span class="break-all">{{ completedTx.data || 'None' }}</span>
          </div>
          <div class="mb-14 form-group">
            <label>数量</label>
            <Amount :value="amount" currency="CT" short sub/>
          </div>
          <div class="mb-14 form-group">
            <label>手续费</label>
            <Amount :value="(completedTx.gasPrice * completedTx.gasLimit)/1e18" currency="CT" short sub/>
          </div>
          <div class="mb-14 form-group">
            <label>接收人将接收</label>
            <Amount :value="amount" :currency="item.name" short sub/>
          </div>
          <div class="form-group mb-14">
            <label>交易哈希</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <button
            @click="cancel"
            class="block w-full mx-auto text-center button button--success md:w-1/2"
          >关闭
          </button>
        </div>
      </template>
    </Modal>

    <LoadingModal :visible="loading"/>

  </div>
</template>

<script>
/*global process*/

import LoadingModal from '@/components/index/LoadingModal'
import {parseAmount} from '@/utils/form'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {LockOpenIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers} from '@vuelidate/validators'
import {mapState} from 'vuex'
import Amount from '../Amount'
import HashLink from '../HashLink'
import Modal from '../Modal'
import Radio from '../Radio'

const Web3 = require('web3')
const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const memoRegexp = /^[a-zA-Z0-9\s-]{0,32}$/
const TRANSACTION_RECEIPT_STATUS = {
  SUCCESS: 1,
  REVERTED: 0
}
const {contract_static_call, contract_gas_call_override, contract_call_override} = require('../../contract/ChainCall')
export default {
  name: 'SendModal',
  components: {
    LoadingModal,
    Amount,
    HashLink,
    LockOpenIcon,
    Modal,
    Radio
  },
  props: {
    close: Function,
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

      recipient: '',
      amount: '',
      memo: '',
      password: '',
      passwordError: '',

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
    ...mapState(['address', 'balance', 'nextNonce']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    amountParsedCalc() {
      if (this.item.type == 'CT') {
        // return parseAmount(this.amount) - this.gas
        return parseAmount(this.amount)
      }
      else {
        return parseAmount(this.amount)
      }
    },
    canReadySend() {
      return ![this.v$.recipient, this.v$.memo, this.v$.amount].map(f => f.$invalid).includes(true)
    },
    canSend() {
      return !this.v$.$invalid
    },
    isMaxAmountEntered() {
      switch (this.item.type) {
      case 'ERC-20':
      case 'ERC-721':
      case 'ERC-1155':
        return this.item.balance > 0 && this.amountParsed === this.item.balance / 1e6
      default:
        return this.balance > 0 && this.amountParsed === this.balance / 1e6
      }
    },
    formattedAmount() {
      console.log(this.item.decimals)
      console.log(this.item.balance)
      if (this.item.decimals == '' || this.item.decimals == null) {
        return Number(this.item.balance)
      }
      else {
        return Number(ethers.utils.formatUnits(this.item.balance, this.item.decimals))
      }
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    }
    // item(oldVal, newVal) {
    //
    //   console.log('item', newVal)
    //   if (newVal != null) {
    //     switch (newVal.type) {
    //     case 'ERC-20':
    //     case 'ERC-721':
    //     case 'ERC-1155':
    //       this.amount = [
    //         validation.required,
    //         ...validation.amount(this.balance, this.amountParsed)
    //       ]
    //       break
    //     default:
    //       this.amount = [
    //         validation.required,
    //         ...validation.amount(this.item.balance, this.amountParsed)
    //       ]
    //     }
    //   }
    // }
  },
  mounted() {

  },
  methods: {

    parseAmount() {
      return ethers.utils.parseUnits(this.amount, this.item.decimals)
    },
    async gasCalc() {
      this.gas = await this.easGasSend()
      this.goto(2)
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
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    goto(step) {
      this.step = step
    },
    readySend() {
      // validate only step 1
      const fields = [this.v$.recipient, this.v$.memo, this.v$.amount]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return


      // 这里计算gas
      this.gasCalc()

    },
    reset() {
      this.goto(1)

      this.recipient = ''
      this.amount = ''
      this.memo = ''
      this.password = ''
      this.passwordError = ''

      this.completedTx = null
      this.submitError = ''

      this.v$.$reset()
    },
    async easGasSend() {
      // 转账为固定手续费
      let gasLimit = 21000
      let gasPrice = 4800
      let customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      let override = {}
      this.loading = true
      switch (this.item.type) {
      case 'ERC-20':
        override = {
          from: this.address
        }
        gasLimit = await contract_gas_call_override(
          ethers,
          this.item.contractAddress,
          ABI_const['JiFenToken'].abi,
          'transfer',
          customHttpProvider,
          [this.recipient, this.parseAmount()],
          override
        )
        if (gasLimit.err != null) {
          console.log('error:', gasLimit.err)
        }
        gasLimit = gasLimit.data.toString()
        this.loading = false
        return gasPrice * gasLimit / 1e9
      case 'ERC-721':

        override = {
          from: this.address
        }
        gasLimit = await contract_gas_call_override(
          ethers,
          this.item.contractAddress,
          ABI_const['ERC721Ctnft'].abi,
          'safeTransferFrom(address,address,uint256)',
          customHttpProvider,
          [this.address, this.recipient, this.item.id],
          override
        )
        this.loading = false
        if (gasLimit.err != null) {
          console.log('error:', gasLimit.err)
        }
        gasLimit = gasLimit.data.toString()

        return gasPrice * gasLimit / 1e9
      case 'ERC-1155':
        override = {
          from: this.address
        }
        gasLimit = await contract_gas_call_override(
          ethers,
          this.item.contractAddress,
          ABI_const['ERC1155Ctnft'].abi,
          'safeTransferFrom',
          customHttpProvider,
          [this.address, this.recipient, this.item.id, this.parseAmount(), '0x'],
          override
        )
        this.loading = false
        if (gasLimit.err != null) {
          console.log('error:', gasLimit.err)
        }
        gasLimit = gasLimit.data.toString()
        return gasPrice * gasLimit / 1e9
      case 'CT':
      default:
        this.loading = false
        return gasPrice * gasLimit / 1e9
      }

    },
    async send() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)
      let customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      let wallet = new ethers.Wallet(privateKey, customHttpProvider)
      // create tx

      let tx
      let override
      this.loading = true
      switch (this.item.type) {

      case 'ERC-20':
        override = {
          from: this.address
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.item.contractAddress,
          ABI_const['JiFenToken'].abi,
          'transfer',
          customHttpProvider,
          [this.recipient, this.parseAmount()],
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          let recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => {
              return ret
            })
            .catch((err) => {
              console.log('err:', err)
            })
          // console.log('recept', recept)
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.loading = false
            this.submitError = recept.err
          }

        } catch (e) {
          console.error(e)
          this.loading = false
          this.submitError = e.message
        }

        break
      case 'ERC-721':
        override = {
          from: this.address
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.item.contractAddress,
          ABI_const['ERC721Ctnft'].abi,
          'safeTransferFrom(address,address,uint256)',
          customHttpProvider,
          [this.address, this.recipient, this.item.id],
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          let recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => {
              return ret
            })
            .catch((err) => {
              console.log('err:', err)
            })
          // console.log('recept', recept)
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.submitError = recept.err
          }

        } catch (e) {
          console.error(e)
          this.submitError = e.message
        }
        break
      case 'ERC-1155':
        override = {
          from: this.address
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.item.contractAddress,
          ABI_const['ERC1155Ctnft'].abi,
          'safeTransferFrom',
          customHttpProvider,
          [this.address, this.recipient, this.item.id, this.parseAmount(), '0x'],
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          let recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => {
              return ret
            })
            .catch((err) => {
              console.log('err:', err)
            })
          // console.log('recept', recept)
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.submitError = recept.err
          }

        } catch (e) {
          console.error(e)
          this.submitError = e.message
        }
        break
      case 'CT':
      default:
        const memo = Buffer.from(this.memo, 'utf8').toString('hex')
        tx = {
          from: this.address,
          to: this.recipient,
          // ... or supports ENS names
          // to: "ricmoo.firefly.eth"
          // We must pass in the amount as wei (1 ether = 1e18 wei), so we
          // use this convenience function to convert ether to wei.
          // gasPrice: ethers.utils.hexlify(0),
          value: ethers.utils.parseEther((this.amountParsedCalc).toString()),
          data: '0x' + memo,
          nonce: this.nextNonce
        }

        // submit tx to blockchain
        try {

          let results = await wallet.sendTransaction(tx)

          let recept = await customHttpProvider
            .waitForTransaction(results.hash)
            .then((ret) => {
              return ret
            })
            .catch((err) => {
              console.log('err:', err)
            })
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = results
            this.goto(3)
          }
          else {
            this.submitError = results[0].reason
          }
        } catch (err) {
          console.error(err)
          this.loading = false
          this.submitError = err.message
        }
      }


    },
    sendOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.send()
    },
    setAmountAsPercent(pct) {
      switch (this.item.type) {
      case 'ERC-20':
        this.amount = (Math.floor(this.formattedAmount * 1e6) / 1e6).toFixed(6)
        break
      case 'ERC-721':
      case 'ERC-1155':
        this.amount = (Math.floor(this.item.balance * 1e6) / 1e6).toFixed(6)
        break
      default:
        this.amount = (Math.floor(this.balance * 1e6) / 1e6).toFixed(6)
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
