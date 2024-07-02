<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>添加支付方式</h2>
    </template>

    <template v-slot:footer>
      <div class="pt-30 border-gray-700 border-solid border-t-default border-opacity-30 pb-30">
        <form class="px-24 ">
          <div class="flex items-start leading-8 text-gray mb-4">
          <span class="flex-shrink-0 inline-block mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
            <p>所有填写的信息都经过加密和签名，只有您自己可以访问和查看。</p>
          </div>
          <div class="mb-16 form-group">
            <label>选择支付方式</label>
            <div class="grid grid-cols-3 gap-2 mt-12">
              <Radio v-for="(items,index) in payTypeArr"
                     v-bind:key="index"
                     name="stake-type-host"
                     :id="index"
                     :extraName="items.name"
                     :label="`\n${items.value}`"
                     :selected="payType == items"
                     @click="setPayType(items)"
              />
            </div>
          </div>
          <div class="grid grid-cols-10 gap-10">
            <div class="form-group col-span-4" :class="{'form-group__error': v$.tovalue.$error}">
              <label for="charge-amount">国家:</label>
              <el-select v-model="coutry" size="large" placeholder="请选择国家" class="w-full">
                <el-option
                  v-for="item in coutrys"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                  <span class="float-left">{{ item.name }}</span>
                  <span
                    class="float-right text-md"
                    style="color: var(--el-text-color-secondary);"
                  >
                    {{ item.value }}
                  </span>
                </el-option>
              </el-select>
            </div>
            <div class="form-group  col-span-4">
              <label for="charge-amount">卡类型:</label>
              <el-select v-model="cardType" size="large" placeholder="请选择卡类型" class="w-full">
                <el-option
                  v-for="item in cardTypes"
                  :key="item.type"
                  :label="item.name"
                  :value="item.type"
                >
                  <span class="float-left">{{ item.name }}</span>
                  <span
                    class="float-right text-md"
                    style="color: var(--el-text-color-secondary);"
                  >
                    {{ item.type }}
                  </span>
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.tovalue.$error}">
            <label for="charge-amount">卡号:</label>
            <input
              type="number"
              autocomplete="off"
              id="charge-amount"
              placeholder="请填写银行卡号"
              v-model="v$.tovalue.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.tovalue.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div class="form-group" :class="{'form-group__error': v$.tovalue.$error}">
              <label for="charge-amount">银行预留手机号码:</label>
              <el-input
                type="number"
                autocomplete="off"
                id="charge-amount"
                placeholder="请填写银行预留手机号码"
                v-model="v$.tovalue.$model"
              >
                <template #suffix>
                  <el-button type="success" size="large" class="font-bold"
                             @click="sendMsgCode">
                    获取验证码
                  </el-button>
                </template>
              </el-input>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.tovalue.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
            </div>
          </div>
          <div class="grid grid-cols-12 gap-5">
            <div class="col-span-3">
              <label for="very-code">点击进行验证</label>
              <el-checkbox
                v-model="isVerifys"
                @change="handleChange"
                size="large"
                label="验证" border></el-checkbox>
              <VueClicaptcha
                v-if="show" :callback="callback" :src="src"/>
            </div>
            <div class="form-group col-span-9" :class="{'form-group__error': v$.tovalue.$error}">
              <label for="very-code">你的验证码</label>
              <input
                type="text"
                autocomplete="off"
                placeholder="请输入你的验证码"
                id="very-code"
                v-model="v$.tovalue.$model"
              />
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.tovalue.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>

            </div>
          </div>
        </form>
        <div class=" px-24 grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="skip">
            关闭
          </button>
          <button class="w-full button button--success" @click.prevent="addPayNext">添加</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Radio from '@/components/Radio.vue'
import * as storage from '@/utils/storage'
import {ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers, required as _required} from '@vuelidate/validators'
import moment from 'moment'
import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'
import Modal from '../Modal'

export default {
  name: 'AuthBindModal',
  components: {
    Radio,
    Modal,
    ShieldExclamationIcon,
    VueClicaptcha
  },
  props: {
    afterCharge: Function,
    close: Function,
    visible: Boolean,
    label: String
  },
  computed: {
    ...mapState(['address']),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  data() {
    return {
      privateKey: '',
      publicKey: '',
      exchangeRate: 10,
      toaddress: '',
      tovalue: '',
      passwordError: '',
      canCopy: !!navigator.clipboard,
      payType: {name: '银行卡', value: 'paycard'},
      payTypeArr: [
        // {name: '微信', value: 'wepay'},
        // {name: '支付宝', value: 'alipay'},
        {name: '银行卡', value: 'paycard'}
      ],
      coutry: '',
      coutrys: [
        // {name: '微信', value: 'wepay'},
        // {name: '支付宝', value: 'alipay'},
        {name: '中国', value: 'china'}
      ],
      cardType: '',
      cardTypes: [
        {name: '建设银行', type: '储蓄卡', value: 'jsback_save'},
        {name: '建设银行', type: '信用卡', value: 'jsback_cred'}
      ],
      isVerifys: false,
      show: false,
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php'
    }
  },

  validations() {
    return {
      toaddress: [
        helpers.withMessage('请输入地址', _required),
        helpers.withMessage('输入的地址无效,请核对后重新输入!', value => {
          const regex = /^(0x[0-9a-fA-F]{40})$/
          if (value === '' || !regex.test(value)) {
            return false
          }
          else {
            return true
          }
        })
      ],
      tovalue: [
        helpers.withMessage('请填写充值金额', _required)
      ]
    }
  },

  watch: {
    address(newVal, oldVal) {
      this.toaddress = this.address
    }
  },
  async mounted() {
    this.toaddress = await storage.getAddress(storage.getHighestWalletVersion())
    this.payType = this.payTypeArr[0]

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
    },
    setPayType(type) {
      this.payType = type
    },
    timeSince(ts) {
      return moment(ts).fromNow()
    },
    cancel() {
      this.reset()
      this.close()
    },
    skip() {
      if (this.label == 'accountPanel') {
        this.cancel()
      }
      else {
        this.reset()
        this.afterCharge()
      }
    },
    async addPayNext() {
      // TODO
      this.reset()
      this.afterCharge()
    },
    async addPay() {
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    createOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.create()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },

    reset() {
      this.password = ''
      this.v$.$reset()
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
.private-key {
  width: 32ch
}

.on-clicked-effect {
  transition: all 0.4s ease-in;
}

.on-clicked-effect:before {
  content: '';
  background-color: aliceblue;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.on-clicked-effect:focus:not(:active) {
  position: relative;
  display: inline-block;
  outline: 0;
}

.on-clicked-effect:focus:not(:active):before {
  animation: clicked_animation 0.8s ease-out;
}

@keyframes clicked_animation {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}
</style>
