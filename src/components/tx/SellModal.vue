<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">提现余额<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" :decimalPlaces="2" currency="RMB"/> 可用
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-4 min-h-350">
          <div class="mb-16 form-group">
            <label>选择提现方式</label>
            <div class="grid grid-cols-4 gap-2 mt-12">
              <Radio v-for="(items,index) in payTypeArr"
                     v-bind:key="index"
                     name="stake-type-host"
                     :id="index"
                     :extraName="items.card_name"
                     :label="`${items.card_id}`"
                     :selected="payType === items"
                     @click="setStakeType(items)"
              />
            </div>
          </div>
          <div
            class="mt-32 lg-input-group"
            :class="{'form-group__error': v$.amount.$error}">
            <label for="amount">数量</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                type="number"
                id="amount"
                placeholder="0.00"
                v-model="v$.amount.$model"
                class="placeholder-white placeholder-opacity-100"
              />
              <span class="absolute right-0 text-xl curren top-23">RMB</span>
              <!-- eslint-disable-next-line max-len -->
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors"
                   :key="error.$uid">{{ error.$message }}
              </div>
            </div>
          </div>

          <div class="mt-32 mb-8 form-group">
            <label class="flex items-center space-x-3">
              手续费
              <!-- eslint-disable-next-line max-len -->
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`这涵盖了草田链交易的成本`">
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
                  <span class="block mb-3 text-gray">您正在提现</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="amountParsed" currency="RMB" short/>
                  </span>
                </div>
                <!-- eslint-disable-next-line max-len -->
                <span
                  class="flex justify-center bg-white py-12  mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                  <img src="/assets/e-logo-alt.svg" alt="RMB" class="flex-shrink-0">
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
                  class="flex justify-center p-8   bg-white mx-auto mb-12 border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                  <img src="/assets/usd-coin-cny-logo.svg" alt="CNY" class="flex-shrink-0">
                </span>
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">您将收到</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="usdcAmount" currency="CNY"/>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <button class="w-full button button--success" :disabled="!canReadySell" @click="readySell">提现</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">提现余额<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" currency="RMB" :decimalPlaces="2"/> 可用
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-12 min-h-300" v-loading="loading" :element-loading-text="loadingText">
          <div class="form-group mb-14">
            <label>您正在提现</label>
            <Amount :value="amountParsed" currency="RMB" short sub/>
          </div>

          <div class="form-group mb-14">
            <label class="label">从</label>
            <HashLink to="explorer" :wallet="address"/>
          </div>

          <div class="form-group mb-14">
            <label class="label">到</label>
            <div>{{ payType.card_name }}</div>
            <div>{{ payType.card_id }}</div>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              手续费
              <!-- eslint-disable-next-line max-len -->
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`这涵盖了草田链交易的成本`">
                <InformationCircleIcon class="hidden md:block button__icon w-15"/>
              </Tooltip>
            </label>
            <Amount :value="fee" currency="CT" short sub/>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              您将收到
            </label>
            <Amount :value="usdcAmount" currency="CNY" sub/>
          </div>
        </div>

        <!-- eslint-disable-next-line max-len -->
        <div v-if="!withinSaleLimit"
             class="px-20 py-20 mb-24 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
          <div class="">
            <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
              价格已更新。交换最大值现在是 {{ exchangeRate.limit }} RMB.
            </span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
          <!-- eslint-disable-next-line max-len -->
          <div class="mb-24 form-group"
               :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <form>
              <label for="password">输入密码</label>
              <div class="relative input-wrap">
                <el-input
                  size="large"
                  autocomplete="off"
                  type="password"
                  placeholder="你的密码"

                  v-model="v$.password.$model"
                  @keypress="sellOnEnter"
                  :prefix-icon="LockOpenIcon"
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
            <v-btn class="w-full" type="success" size="large" plain @click="() => goto(1)">
              返回
            </v-btn>
            <v-btn class="w-full" :loading="loading" type="success" :disabled="!canSell" size="large" @click="sell">
              确认
            </v-btn>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">提现已接受<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">

          <div class="form-group mb-14">
            <label>您正在提现</label>
            <Amount :value="completedTx.amount" currency="RMB" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>从</label>
            <HashLink to="explorer" :wallet="address"/>
          </div>

          <div class="form-group mb-14">
            <label>到</label>
            <div>{{ payType.card_name }}</div>
            <div>{{ payType.card_id }}</div>
          </div>

          <div class="form-group mb-14">
            <label>手续费</label>
            <Amount :value="feeOnSubmit" currency="CT" short sub/>
          </div>

          <!--          <div class="form-group mb-14">-->
          <!--            <label>价格</label>-->
          <!--            <Amount :value="exchangeRateOnSubmit" currency="CNY" sub/>-->
          <!--          </div>-->

          <div class="form-group mb-14">
            <label>您将收到</label>
            <Amount :value="usdcAmountOnSubmit" currency="CNY" sub/>
          </div>

          <div class="form-group mb-14">
            <label>交易哈希</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
          </div>

          <div class="flex items-center mt-24 leading-8 text-gray">
            <!-- eslint-disable-next-line max-len -->
            <p class="mb-0">您的请求已被接受，应该会尽快处理。如果您的请求因任何原因无法处理，您的余额将被退回。</p>
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
  </div>
</template>

<script>

import Radio from '@/components/Radio.vue'
import ABI_const from '@/contract/ABI_const'
import {fetchExchangeRates, fetchGasRates} from '@/utils/api'
import {parseAmount} from '@/utils/form'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {ArrowDownIcon, ArrowRightIcon, LockOpenIcon} from '@heroicons/vue/outline'
import {InformationCircleIcon} from '@heroicons/vue/solid'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import {getCardList} from '../../utils/storage'
import Amount from '../Amount'
import HashLink from '../HashLink'
import Modal from '../Modal'
import Tooltip from '../Tooltip'

const _addressC = require('@/config/address.json')
const ethers = require('ethers')
const exchangeRateUpdateInterval = 15 * 1000
const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'SellModal',
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

      exchangeRate: {},
      gasRates: {},
      iExchangeRate: null,
      iGasRates: null,

      amount: '',
      password: '',
      passwordError: '',

      completedTx: null,
      submitError: '',
      feeOnSubmit: 0,
      exchangeRateOnSubmit: 0,
      usdcAmountOnSubmit: 0,
      payType: {},
      payTypeArr: [
        // {name: '建设银行', value: '****5678'},
        // {name: '农业银行', value: '****5679'},
        // {name: '中信银行', value: '****5670'}
      ],
      loading: false,
      loadingText: ''
    }
  },
  validations() {
    return {
      amount: [
        validation.required,
        ...validation.amount(this.xctBalance, this.amountParsed)
        // helpers.withParams(
        //   { saleLimit: this.saleLimit },
        //   helpers.withMessage(`The exchange maximum is ${this.saleLimit} CT.`, () => this.withinSaleLimit)
        // )
      ],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'xctBalance']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    canReadySell() {
      return ![this.v$.amount].map(f => f.$invalid).includes(true) && this.usdcAmount > 0
    },
    canSell() {
      return !this.v$.$invalid && this.withinSaleLimit && this.usdcAmount > 0
    },
    saleLimit() {
      return this.exchangeRate.limit || 0
    },
    withinSaleLimit() {
      return this.amountParsed <= this.saleLimit
    },
    rateAge() {
      if (this.exchangeRate.date === undefined) return '...'
      const date = new Date(this.exchangeRate.date)
      const ms = Date.now() - date.getTime()
      const s = Math.floor(ms / 1000)
      const unit = s === 1 ? 'second' : 'seconds'
      return `${s} ${unit} ago`
    },
    minimumFee() {
      if (this.gasRates.minimumHandlingFee === undefined) return NaN
      if (this.exchangeRate.gas === undefined) return NaN
      const {handlingFeePercentage, minimumHandlingFee} = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.max(percentageFee, minimumHandlingFee)
    },
    fee() {
      if (this.exchangeRate.gas === undefined) return NaN
      return this.minimumFee + this.exchangeRate.gas
    },
    usdcAmount() {
      return Math.max(0, this.amountParsed - this.fee) * this.exchangeRate.rate
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
        this.updateExchangeRate()
        this.updateGasRates()
        this.iExchangeRate = setInterval(this.updateExchangeRate, exchangeRateUpdateInterval)
        this.iGasRates = setInterval(this.updateGasRates, gasRatesUpdateInterval)
      }
      else {
        clearInterval(this.iExchangeRate)
        clearInterval(this.iGasRates)
        this.iExchangeRate = null
        this.iGasRates = null
      }
    }
  },
  async mounted() {
    const cardList = await getCardList(this.address)
    console.log(cardList)
    if (cardList) {
      this.payTypeArr = cardList['card_lists']
      this.payType = this.payTypeArr[0]
    }
  },
  methods: {

    setStakeType(type) {
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
    readySell() {
      // validate only step 1
      const fields = [this.v$.amount]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return
      this.goto(2)
    },
    reset() {
      this.goto(1)

      this.amount = ''
      this.password = ''

      this.completedTx = null
      this.submitError = ''
      this.feeOnSubmit = 0
      this.exchangeRateOnSubmit = 0
      this.usdcAmountOnSubmit = 0

      this.v$.$reset()
    },
    async sell() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      const CtXCTAddress = _addressC['XCT']

      const contract = new ethers.Contract(
        CtXCTAddress,
        ABI_const['XCT'].abi,
        customHttpProvider
      )

      const contractWithSigner = contract.connect(wallet)

      const value = this.amountParsed * 100

      // submit tx to blockchain
      try {
        this.loading = true
        this.loadingText = '提现请求上链中'
        const tx = await contractWithSigner.redeem(value, 1)
        // const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
        // if (metadata.accepted) {
        //   this.completedTx = results[0]
        //   this.feeOnSubmit = this.fee
        //   this.exchangeRateOnSubmit = this.exchangeRate.rate
        //   this.usdcAmountOnSubmit = this.usdcAmount
        //   this.goto(3)
        // }
        // else {
        //   this.submitError = results[0].reason
        // }
        this.completedTx = {
          amount: this.amount,
          hash: tx.hash
        }
        this.feeOnSubmit = this.fee
        this.exchangeRateOnSubmit = this.exchangeRate.rate
        this.usdcAmountOnSubmit = this.usdcAmount
        // TODO 这里向支付网关发起提现请求
        setTimeout(() => {
          this.cleanLoad()
          this.goto(3)
        }, 1000)
      }
      catch (err) {
        this.loading = false
        console.error(err)
        this.submitError = err.message
      }
    },
    cleanLoad() {
      this.loading = false
      this.loadingText = ''
    },
    sellOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.sell()
    },
    async updateExchangeRate() {
      this.exchangeRate = await fetchExchangeRates()
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
    }
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon
    }
  }
}
</script>

<style scoped>
</style>
