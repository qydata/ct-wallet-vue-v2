<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">{{ p_type ? '赞成声明' : '反对声明' }}<span class="testnet-header"
                                                                     v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-14">
            <label>订单号</label>
            {{ shortHash(publicity.id) }}
          </div>
          <div class="mb-16 form-group">
            <label>充值金额</label>
            <Amount :value="publicity._chainpayOrder_value" decimalPlaces="2" currency="CNY" short sub/>
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
                <el-input
                  size="large"
                  type="password"
                  autocomplete="off"
                  placeholder="你的密码"
                  id="pass-step"
                  v-model="v$.password.$model"
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
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <v-btn type="success" size="large" plain @click="cancel">返回</v-btn>
            <v-btn :loading="loading"
                       :disabled="!canUnlock"
                       @click="handlerZf"
                       type="success"
                       size="large"
            >{{ p_type ? '赞成' : '反对' }}
            </v-btn>
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

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">申请已提交<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-25">
            <label class="label">类型</label>
            <span class="break-all text-3xl">{{ p_type ? '赞成' : '反对' }}</span>
          </div>
          <div class="form-group mb-25">
            <label class="label">充值金额</label>
            <Amount :value="publicity._chainpayOrder_value" decimalPlaces="2" currency="CNY" short sub/>
          </div>
          <!--          <div class="mb-16 form-group">-->
          <!--            <label>Fee</label>-->
          <!--            <Amount :value="0" currency="CT" short sub/>-->
          <!--          </div>-->
          <div class="form-group mb-14">
            <label>交易哈希</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
          </div>
          <div class="flex items-center mt-24 leading-8 text-gray">
            <!-- eslint-disable-next-line max-len -->
            <p class="mb-0">您的申请已提交。</p>
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
/*global process*/

import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {LockOpenIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import Amount from '../Amount'
import HashLink from '../HashLink'
import Modal from '../Modal'

const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const _addressC = require('@/config/address.json')

export default {
  name: 'TrueAndFalsePublicityModal',
  components: {
    Amount,
    HashLink,
    LockOpenIcon,
    Modal
  },
  props: {
    close: Function,
    publicity: Object,
    visible: Boolean,
    p_type: Boolean
  },
  data() {
    return {
      step: 1,

      password: '',
      passwordError: '',

      completedTx: null,
      submitError: '',

      loading: false,
      loadingText: ''
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'nextNonce']),
    canUnlock() {
      return !this.v$.$invalid
    },
    completedTxShortHash() {
      if (this.completedTx === null) return ''
      return [
        this.completedTx.hash.substring(0, 6),
        this.completedTx.hash.substring(this.completedTx.hash.length - 4)
      ].join('...')
    },
    publicityShortId() {
      if (this.publicity === null) return ''
      return [
        this.publicity.id.substring(0, 6),
        this.publicity.id.substring(this.publicity.id.length - 4)
      ].join('...')
    },
    unlockPeriodInDays() {
      return this.publicity.unlockPeriod / 1000 / 3600 / 24
    },
    unlocksAt() {
      if (this.publicity) return this.completedTx.timestamp + this.publicity.unlockPeriod
      else return null
    },
    unlocksAtDate() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[0]
    },
    unlocksAtTime() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[1]
    }
  },
  methods: {
    shortHash(hash) {
      if (hash === null) return ''
      return [
        hash.substring(0, 10),
        hash.substring(hash.length - 8)
      ].join('...')
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
    reset() {
      this.goto(1)

      this.password = ''
      this.passwordError = ''
      this.submitError = ''
      this.completedTx = undefined

      this.v$.$reset()
    },
    async handlerZf() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      const CtXCTAddress = _addressC['ChainpayClient']

      const contract = new ethers.Contract(
        CtXCTAddress,
        ABI_const['ChainpayClient'].abi,
        customHttpProvider
      )

      const contractWithSigner = contract.connect(wallet)

      // submit tx to blockchain
      try {

        this.loading = true
        this.loadingText = '提现请求上链中'
        const txGasLimit = await contractWithSigner.callStatic.fulfill(this.publicity.id, this.p_type)
        console.log('gasLimit:', txGasLimit)
        const tx = await contractWithSigner.fulfill(this.publicity.id, this.p_type)

        this.completedTx = {
          hash: tx.hash
        }
        // TODO 这里向支付网关发起提现请求
        setTimeout(() => {
          this.cleanLoad()
          this.goto(2)
        }, 1000)
      }
      catch (err) {
        this.loading = false
        console.error(err)
        this.submitError = this.proErrMessage(err.errorArgs[0])
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
    cleanLoad() {
      this.loading = false
      this.loadingText = ''
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    }
  }
}
</script>

<style scoped>
</style>
