<template>
  <div>


    <Modal :close="cancel" :visible="visible">
      <template v-slot:header>

        <div v-if="step === -1">
          <h2 class="mb-8">充值声明<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" :decimalPlaces="2" currency="RMB"/> 可用
        </span>

        </div>
        <div v-else-if="step === 1">
          <h2 class="mb-8">充值余额<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" :decimalPlaces="2" currency="RMB"/> 可用
        </span>

        </div>
        <div v-else-if="step === 2"><h2 class="mb-8">充值余额<span class="testnet-header"
                                                                   v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="xctBalance" currency="RMB" :decimalPlaces="2"/> 可用
        </span></div>
        <div v-else-if="step === 3"><h2 class="mb-8">充值已接受<span class="testnet-header"
                                                                     v-if="isTestnet">(Testnet)</span></h2></div>
        <!--        <el-steps-->
        <!--          style="max-width: 600px "-->
        <!--          :space="200"-->
        <!--          class="mt-5"-->
        <!--          align-center="true"-->
        <!--          :active="0"-->
        <!--          process-status="finish"-->
        <!--          finish-status="success"-->
        <!--        >-->
        <el-steps
          style="max-width: 600px "
          :space="200"
          class="mt-5"
          align-center="true"
          :active="getSteps().active"
          :process-status="getSteps().process"
          :finish-status="getSteps().finish"
        >
          <el-step title="扣款"/>
          <el-step title="声明"/>
          <el-step title="完成"/>
        </el-steps>

      </template>

      <template v-slot:body>

        <div v-if="step === -1" v-loading="loading" :element-loading-text="loadingText">
          <div class="py-32 border-t border-gray-700 border-opacity-30">
            <!-- eslint-disable-next-line max-len -->
            <div class="mb-24 form-group">
              <form>
                <label for="pass-buy">输入密码</label>
                <div class="relative input-wrap">
                  <el-input
                    size="large"
                    autocomplete="off"
                    type="password"
                    placeholder='请输入你的密码'
                    id="pass-buy"
                    v-model="password"
                    @keypress="withdrawOnEnter"
                    :prefix-icon="LockOpenIcon"
                  />
                </div>
                <!-- eslint-disable-next-line max-len -->
                <div class="form-group__error input-error" v-if="passwordError">
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
          </div>
        </div>

        <div v-else-if="step === 1">
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
              <el-input
                type="text"
                readonly
                placeholder="草田链地址"
                id="send1"
                size="large"
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
                <el-input
                  size="large"
                  type="number"
                  id="amount-send"
                  placeholder="0.00"
                  v-model="v$.amount.$model"
                  class="placeholder-white placeholder-opacity-100"
                />
                <span class="absolute right-0 text-xl curren top-23">rmb</span>
                <!-- eslint-disable-next-line max-len -->
                <div class="mt-5 form-group__error input-error" style="color: #CD5F4E"
                     v-for="error of v$.amount.$errors"
                     :key="error.$uid">{{ error.$message }}
                </div>
              </div>
            </div>

            <div class="mt-32 mb-8 form-group">
              <label class="flex items-center space-x-3">
                手续费
                <Tooltip
                  :text="`包含 ${minimumFee} rmb手续费`"
                  class="ml-3"
                  position="right"
                  theme="dark"
                >
                  <InformationCircleIcon class="hidden md:block button__icon w-15"/>
                </Tooltip>
              </label>
              <Amount :value="fee" currency="rmb" short sub/>
            </div>
          </div>
        </div>
        <div v-else-if="step === 2" v-loading="loading" :element-loading-text="loadingText">
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
                <Tooltip class="ml-3" position="right" theme="dark" :text="`包括 ${minimumFee} rmb 的手续费`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15"/>
                </Tooltip>
              </label>
              <Amount :value="fee" currency="rmb" short sub/>
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
              <Amount :value="edgeAmount" currency="RMB" sub/>
            </div>
          </div>
        </div>
        <div v-else-if="step === 3">
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
              <Amount :value="edgeAmount" currency="RMB" sub/>
            </div>

            <div class="form-group mb-14">
              <label>交易哈希</label>
              <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
            </div>

            <div class="flex items-center mt-24 leading-8 text-gray">
              <p class="mb-0">您的请求已被接受，应该很快被处理。</p>
            </div>
          </div>
        </div>
        <div></div>
      </template>

      <template v-slot:footer>
        <div v-if="step === -1">
          <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
            <!-- eslint-disable-next-line max-len -->
            <div class="grid grid-cols-1 gap-24 pt-12 md:grid-cols-2">
              <button class="w-full button button--outline-success" :disabled="loading" @click="() => goto(1)">返回
              </button>
              <button class="w-full button button--success" :disabled="!canBuy" @click="Declare">确认</button>
            </div>
          </div>
        </div>
        <div v-else-if="step === 1">
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
                    <Amount :value="edgeAmount" currency="RMB"/>
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
        </div>
        <div v-else-if="step === 2">
          <div class="px-24 py-32 border-t border-gray-700 border-opacity-30 ">
            <!-- eslint-disable-next-line max-len -->
            <div class="grid grid-cols-12 gap-10">
              <div class="form-group col-span-7">
                <label>你的手机号码</label>
                <el-input
                  type="text"
                  size="large"
                  autocomplete="off"
                  placeholder="请输入你的手机号码"
                  readonly
                  id="tel-number"
                  v-model="mobile"
                >
                  <template #append>
                    <v-btn type="success" size="large" class="font-bold" @click.prevent="sendMsgCode">
                      {{ nextTime == 0 ? '获取验证码' : nextTime + '秒' }}
                    </v-btn>
                  </template>
                </el-input>

              </div>
              <div class="form-group  col-span-5"
                   :class="{'form-group__error': v$.msgCode.$error}">
                <form>
                  <label for="pass-buy">输入验证码</label>
                  <el-input
                    size="large"
                    autocomplete="off"
                    type="text"
                    :readonly="loading"
                    placeholder='请输入你的验证码'
                    id="pass-buy"
                    v-model="v$.msgCode.$model"
                    @keypress="withdrawOnEnter"
                  />
                  <!-- eslint-disable-next-line max-len -->
                  <div class="form-group__error input-error" v-for="error of v$.msgCode.$errors" :key="error.$uid">
                    {{ error.$message }}
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
              <div class="col-start-6 col-span-6">

                <!--              <VueHcaptcha theme="dark"-->
                <!--                           sitekey="a0bce798-5c05-4ab9-96ae-d15863e4e5fa"-->
                <!--                           @verify="onVerify"></VueHcaptcha>-->
                <label for="very-code">点击进行验证</label>
                <el-checkbox
                  style="color: white;"
                  v-model="isVerifys"
                  @change="handleChange"
                  size="large"
                  label="验证" border></el-checkbox>
                <VueClicaptcha
                  v-if="show" :callback="callback" :src="src"/>
              </div>
              <div class=" form-group grid col-span-12 grid-cols-12 mb-4 "
                   :class="{'form-group__error': v$.isVerifys.$error}">
                <!-- eslint-disable-next-line max-len -->
                <div class="form-group__error input-error col-start-6 col-span-5" v-for="error of v$.isVerifys.$errors"
                     :key="error.$uid">
                  {{ error.$message }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-24 pt-12 md:grid-cols-2">
              <button class="w-full button button--outline-success" :disabled="loading" @click="() => goto(1)">返回
              </button>
              <button class="w-full button button--success" :disabled="loading" @click="Chargebacks">确认</button>
            </div>
          </div>
        </div>
        <div v-else-if="step === 3">
          <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
            <!-- eslint-disable-next-line max-len -->
            <button class="block w-full mx-auto text-center button button--success md:w-1/2" @click="cancel">关闭
            </button>
          </div>
        </div>
      </template>
    </Modal>

  </div>
</template>
<script>

import Radio from '@/components/Radio.vue'
import {fetchGasRates} from '@/utils/api'
import {parseAmount} from '@/utils/form'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {ArrowDownIcon, ArrowRightIcon, LockOpenIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {required as _required, helpers} from '@vuelidate/validators'
import {mapState} from 'vuex'
import {getCardList, getPrivateKey} from '../../utils/storage'
import Amount from '../Amount'
import HashLink from '../HashLink'
import Modal from '../Modal'
import Tooltip from '../Tooltip'

const ABI_const = require('@/contract/ABI_const.js')
const _addressC = require('@/config/address.json')
const ethers = require('ethers')
const ethUtil = require('ethereumjs-util')

const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'WithdrawModal',
  components: {
    Amount,
    HashLink,
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
      ],
      msgCode: '',
      nextTime: 0,
      mobile: '',
      isVerifys: false,
      show: false,
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php',
      loading: false,
      loadingText: ''
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
      msgCode: [
        helpers.withMessage('请输入验证码', _required),
        helpers.withMessage('验证码输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^\d{4}$/
          return phoneReg.test(v)
        })
      ],
      isVerifys: [
        helpers.withMessage('请验证!', v => v == true)
      ]
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
      return this.minimumFee + this.gasRate
    },
    edgeAmount() {
      return Math.max(0, this.amountParsed - this.fee)
    }
  },
  watch: {
    async visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
        this.updateGasRates()
        this.iGasRates = setInterval(this.updateGasRates, gasRatesUpdateInterval)

        this.recipient = this.address
        const cardList = await getCardList(this.address)
        console.log(cardList)
        if (cardList) {
          this.payTypeArr = cardList['card_lists']
          this.payType = this.payTypeArr[0]
          this.mobile = this.payType.mobile
        }
      }
      else {
        clearInterval(this.iGasRates)
        this.iGasRates = null
      }
    }
  },
  async mounted() {

  },
  methods: {
    callback(val) {
      console.log(val)
      if (val.status == true) {
        this.show = false
        this.isVerifys = true
        this.hcaptchaResp = val
      }
      else {
        this.isVerifys = false
      }
    },
    handleChange() {
      this.show = true
    },
    sendMsgCode() {

      // 这里进行验证码验证
      if (this.nextTime != 0) {
        this.$message.error('当前验证码有效!')
      }
      else if (this.hcaptchaResp == null) {
        this.$message.error('请先通过验证')
      }
      else {
        this.$message.success('发送成功!')
        // 开始短信倒计时
        this.nextTime = 60
        this.countTime()
        // sendTelCode({tel: this.mobile, hcaptcha: this.hcaptchaResp}).then(res => {
        //   console.log(res)
        //   if (res.code !== 1) {
        //     this.$message.error(res.msg)
        //   }
        //   else {
        //     this.$message.success('发送成功!')
        //     // 开始短信倒计时
        //     this.nextTime = 60
        //     this.countTime()
        //
        //   }
        // }).catch((e) => {
        //   console.trace(e)
        //   this.$message.error('网络请求失败')
        // })
      }
    },
    countTime() {
      this.nextTime = this.nextTime - 1
      if (this.nextTime == 0) {
        return
      }
      window.setTimeout(this.countTime, 1000)
    },
    getSteps() {
      switch (this.step) {
      case 1:
      case 2:
        return {
          active: 0,
          process: 'finish',
          finish: 'success'
        }
      case -1:
        return {
          active: 1,
          process: 'finish',
          finish: 'success'
        }
      case 3:
        return {
          active: 3,
          process: 'finish',
          finish: 'success'
        }
      default:
        return {
          active: 0
        }
      }
    },
    setPayType(type) {
      this.payType = type
      this.mobile = this.payType.mobile
    },
    cancel() {
      this.reset()
      this.close()
    },
    async checkPassword() {
      this.passwordError = ''
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
      if (step == 1) {
        this.loading = false
        this.loadingText = ''
      }
      this.step = step
    },
    readyWithdraw() {
      // validate only step 1
      const fields = [this.v$.recipient, this.v$.amount]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return

      if (this.payTypeArr.length == 0) {
        this.$message.error('暂无支付方式,请先在我的支付中添加')
        return
      }

      this.goto(2)
    },
    reset() {
      this.goto(1)

      this.amount = ''
      this.password = ''
      this.amount = ''
      this.msgCode = ''
      this.submitError = ''
      this.completedTx = null
      this.edgeAmountOnSubmit = 0
      this.feeOnSubmit = 0
      this.mobile = ''
      this.password = ''
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
    },
    // 扣款
    async Chargebacks() {

      this.passwordError = ''
      if (!await this.v$.$validate()) return
      this.loading = true
      this.loadingText = '请求银行网关支付中'
      // TODO 请求银行网关支付
      setTimeout(() => {
        this.goto(-1)
        this.cleanLoad()
      }, 2000)
    },
    cleanLoad() {
      this.loading = false
      this.loadingText = ''
    },
    // 声明
    async Declare() {

      try {
        this.passwordError = ''
        if (!await this.v$.$validate()) return
        if (!await this.checkPassword()) return
        const privateKey = await getPrivateKey(this.password)

        const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
          chainId: 27
        })
        const wallet = new ethers.Wallet(privateKey, customHttpProvider)
        const contract = new ethers.Contract(
          _addressC['ChainpayClient'],
          ABI_const['ChainpayClient'].abi,
          customHttpProvider
        )
        const contractWithSigner = contract.connect(wallet)

        const orderId = `0x${ethUtil
          .keccak256(Buffer.from(new Date().getTime().toString()))
          .toString('hex')}`

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

        this.loading = true
        this.loadingText = '声明上链中'

        // submit tx to blockchain
        const txGasLimit = await contractWithSigner.callStatic.requestDataFromChainpay(orderId, this.amount)
        console.log('gasLimit', txGasLimit)
        const tx = await contractWithSigner.requestDataFromChainpay(orderId, this.amount)
        await tx.wait()
        console.log(tx.hash)

        this.completedTx = {
          amount: this.amount,
          hash: tx.hash,
          data: {
            destination: this.recipient,
            memo: 'CT Withdrawal',
            ref: this.gasRates.ref,
            token: 'RMB'
          }
        }
        this.goto(3)
        this.cleanLoad()
      }
      catch (err) {
        console.error(err)
        this.proErrMessage(err.errorArgs[0])
        this.cleanLoad()
      }
    },
    proErrMessage(err) {
      switch (err) {
      case 'Source must be the oracle of the request':
        return '当前账户非验证者账户'
      default:
        return err
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
      v$: useVuelidate(),
      LockOpenIcon
    }
  }
}
</script>

<style scoped>
</style>
