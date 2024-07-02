<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">充值余额<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" :decimalPlaces="2" currency="XCT"/> 可用
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-4 min-h-300">
          <div class="form-group mb-8" :class="{'form-group__error': v$.recipient.$error}">
            <label for="send1" class="flex items-center space-x-3 label">
              充值至
              <Tooltip
                class="ml-3" position="right" theme="dark" :wide="true"
                text="这是将持有您的XCT的草田链钱包">
                <InformationCircleIcon class="hidden md:block button__icon w-15"/>
              </Tooltip>
            </label>
            <input
              type="text"
              readonly
              placeholder="草田链地址"
              id="send1"
              maxlength="43"
              v-model="v$.recipient.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.recipient.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>

          <div
            class="mt-32 lg-input-group"
            :class="{'form-group__error': v$.amount.$error}">
            <label for="key">数量</label>
            <div class="relative input-wrap">
              <input
                type="number"
                id="amount-send"
                placeholder="0.00"
                v-model="v$.amount.$model"
                class="placeholder-white placeholder-opacity-100"
              >
              <span class="absolute right-0 text-xl curren top-23">￥</span>
              <!-- eslint-disable-next-line max-len -->
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors"
                   :key="error.$uid">{{ error.$message }}
              </div>
            </div>
          </div>

          <div class="mt-32 mb-8 form-group">
            <label class="flex items-center space-x-3">
              手续费
              <Tooltip
                :text="`包含 ${minimumFee} CT 手续费`"
                class="ml-3"
                position="right"
                theme="dark"
              >
                <InformationCircleIcon class="hidden md:block button__icon w-15"/>
              </Tooltip>
            </label>
            <Amount :value="fee" currency="CT" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <!-- eslint-disable-next-line max-len -->
          <div
            class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="md:flex">
              <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">您正在充值</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="amountParsed" currency="CNY" short/>
                  </span>
                </div>
                <!-- eslint-disable-next-line max-len -->
                <span
                  class="flex justify-center mx-auto  p-8   bg-white mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                  <img src="/assets/usd-coin-cny-logo.svg" alt="CT Wallet" class="flex-shrink-0">
                </span>
                <!-- eslint-disable-next-line max-len -->
                <span
                  class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                  <ArrowRightIcon class="hidden md:block"/>
                  <ArrowDownIcon class="block md:hidden"/>
                </span>
              </div>
              <div class="right md:w-1/2 md:flex md:pl-18">
                <!-- eslint-disable-next-line max-len -->
                <span
                  class="flex justify-center px-6 py-12 bg-white mx-auto mb-12 border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                  <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                </span>
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">您将收到</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="edgeAmount" currency="XCT"/>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <button
              :disabled="!canReadyBuy"
              @click="readyWithdraw"
              class="w-full button button--success"
            >充值
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">充值余额<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" currency="XCT" :decimalPlaces="2"/> 可用
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-12 min-h-300">
          <div class="form-group mb-14">
            <label>您正在充值</label>
            <Amount :value="amount" currency="CNY" sub/>
          </div>

          <div class="mb-16 form-group">
            <label>选择支付方式</label>
            <div class="grid grid-cols-4 gap-2 mt-12">
              <Radio v-for="(items,index) in payTypeArr"
                     v-bind:key="index"
                     name="stake-type-host"
                     :id="index"
                     :extraName="items.card_name"
                     :label="`${items.card_id}`"
                     :selected="payType === items"
                     @click="setPayType(items)"
              />
            </div>
          </div>
          <div class="form-group mb-14">
            <label class="label">从</label>
            <div>{{ payType.card_name }}</div>
            <div>{{ payType.card_id }}</div>
          </div>

          <div class="form-group mb-14">
            <label class="label">To</label>
            <HashLink to="etherscan" :wallet="recipient"/>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              手续费
              <Tooltip class="ml-3" position="right" theme="dark" :text="`包括 ${minimumFee} CT 的手续费`">
                <InformationCircleIcon class="hidden md:block button__icon w-15"/>
              </Tooltip>
            </label>
            <Amount :value="fee" currency="CT" short sub/>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              您将收到
              <Tooltip
                class="ml-3" position="right" :wide="true" theme="dark"
                :text="`您可能会收到这些`">
                <InformationCircleIcon class="hidden md:block button__icon w-15"/>
              </Tooltip>
            </label>
            <Amount :value="edgeAmount" currency="XCT" sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
          <!-- eslint-disable-next-line max-len -->
          <div class="mb-24 form-group"
               :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <form>
              <label for="pass-buy">输入密码</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  autocomplete="off"
                  type="password"
                  placeholder='请输入你的密码'
                  id="pass-buy"
                  v-model="v$.password.$model"
                  @keypress="withdrawOnEnter"
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
            </form>
          </div>

          <!-- eslint-disable-next-line max-len -->
          <div v-if="submitError"
               class="px-20 py-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
                发生了错误 ({{ submitError }})。 请再试一次。
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-24 pt-12 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="() => goto(1)">返回</button>
            <button class="w-full button button--success" :disabled="!canBuy" @click="buy">确认</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">充值已接受<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">

          <div class="form-group mb-14">
            <label>您正在充值</label>
            <Amount :value="completedTx.amount" currency="CNY" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>从</label>
            <div>{{ payType.card_name }}</div>
            <div>{{ payType.card_id }}</div>
          </div>

          <div class="form-group mb-14">
            <label>到</label>
            <HashLink to="etherscan" :wallet="completedTx.data.destination"/>
          </div>

          <div class="form-group mb-14">
            <label>手续费</label>
            <Amount :value="feeOnSubmit" currency="CT" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>您将收到</label>
            <Amount :value="edgeAmount" currency="XCT" sub/>
          </div>

          <div class="form-group mb-14">
            <label>交易哈希</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
          </div>

          <div class="flex items-center mt-24 leading-8 text-gray">
            <p class="mb-0">您的请求已被接受，应该很快被处理。</p>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <!-- eslint-disable-next-line max-len -->
          <button class="block w-full mx-auto text-center button button--success md:w-1/2" @click="cancel">关闭</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
/*global process*/

import Radio from '@/components/Radio.vue'
import {fetchGasRates} from '@/utils/api'
import {parseAmount} from '@/utils/form'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {ArrowDownIcon, ArrowRightIcon, LockOpenIcon} from '@heroicons/vue/outline'
import {InformationCircleIcon} from '@heroicons/vue/solid'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import Amount from '../Amount'
import HashLink from '../HashLink'
import Modal from '../Modal'
import Tooltip from '../Tooltip'

const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'WithdrawModal',
  components: {
    Radio,
    Amount,
    ArrowDownIcon,
    ArrowRightIcon,
    HashLink,
    InformationCircleIcon,
    LockOpenIcon,
    Modal,
    Tooltip
  },
  props: {
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      gasRates: {},
      iGasRates: null,

      recipient: '',
      amount: '',
      password: '',
      passwordError: '',

      submitError: '',
      completedTx: null,
      edgeAmountOnSubmit: 0,
      feeOnSubmit: 0,
      payType: {},
      payTypeArr: [
        // {name: '建设银行', value: '****5678'},
        // {name: '农业银行', value: '****5679'},
        // {name: '中信银行', value: '****5670'}
      ]

    }
  },
  validations() {
    return {
      recipient: [
        validation.required,
        validation.ethAddress
      ],
      amount: [
        validation.required
      ],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'xctBalance']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    canReadyBuy() {
      console.log(this.edgeAmount)
      return ![this.v$.recipient, this.v$.amount].map(f => f.$invalid).includes(true) && this.edgeAmount > 0
    },
    canBuy() {
      return !this.v$.$invalid && this.edgeAmount > 0
    },
    gasRate() {
      return this.gasRates.fee
    },
    minimumFee() {
      if (this.gasRate === undefined || isNaN(this.amountParsed)) return NaN
      const {handlingFeePercentage, minimumHandlingFee} = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.max(percentageFee, minimumHandlingFee)
    },
    fee() {
      if (this.gasRate === undefined || isNaN(this.amountParsed)) return NaN
      return Math.round(this.minimumFee + this.gasRate)
    },
    edgeAmount() {
      return Math.max(0, this.amountParsed - this.fee)
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
        this.updateGasRates()
        this.iGasRates = setInterval(this.updateGasRates, gasRatesUpdateInterval)
      }
      else {
        clearInterval(this.iGasRates)
        this.iGasRates = null
      }
    }
  },
  mounted() {
    this.recipient = this.address
    let cardList = this.$cookies.get('cardList')
    console.log(cardList)
    if (cardList) {
      this.payTypeArr = cardList['card_lists']
    }
    this.payType = this.payTypeArr[0]

  },
  methods: {

    setPayType(type) {
      this.payType = type
    },
    cancel() {
      this.reset()
      this.close()
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
    readyWithdraw() {
      // validate only step 1
      const fields = [this.v$.recipient, this.v$.amount]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return
      this.goto(2)
    },
    reset() {
      this.goto(1)

      this.amount = ''
      this.password = ''

      this.submitError = ''
      this.completedTx = null
      this.edgeAmountOnSubmit = 0
      this.feeOnSubmit = 0

      this.v$.$reset()
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
    },
    async buy() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)

      // create tx
      // const tx = xe.tx.sign({
      //   timestamp: Date.now(),
      //   sender: this.address,
      //   recipient: process.env.VUE_APP_BRIDGE_WALLET_ADDRESS,
      //   amount: toMicroXe(this.amountParsed),
      //   data: {
      //     destination: this.recipient,
      //     memo: 'CT Withdrawal',
      //     ref: this.gasRates.ref,
      //     token: 'XCT'
      //   },
      //   nonce: this.nextNonce
      // }, privateKey)

      // submit tx to blockchain
      try {
        const capture = {
          edgeAmountOnSubmit: this.edgeAmount,
          feeOnSubmit: this.fee
        }
        // 这里打开支付宝或者什么进行支付
        // const {metadata, results} = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
        // if (metadata.accepted) {
        //   this.completedTx = results[0]
        //   this.edgeAmountOnSubmit = capture.edgeAmountOnSubmit
        //   this.feeOnSubmit = capture.feeOnSubmit
        //   this.goto(3)
        // }
        // else {
        //   this.submitError = results[0].reason
        // }
        // TODO 临时参数
        this.completedTx = {
          amount: this.amount,
          hash: '123456789012345678',
          data: {
            destination: this.recipient,
            memo: 'CT Withdrawal',
            ref: this.gasRates.ref,
            token: 'XCT'
          }
        }
        this.goto(3)
      } catch (err) {
        console.error(err)
        this.submitError = err.message
      }
    },
    withdrawOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.buy()
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

.convert-info :deep(.amount .currency) {
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
</style>
