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
          <div class="grid grid-cols-12 gap-10">
            <div class="form-group  col-span-5">
              <label for="charge-amount">卡类型:</label>
              <el-select v-model="cardType" size="large" placeholder="请选择卡类型" class="">
                <el-option
                  v-for="item in cardTypes"
                  :key="item.type"
                  :label="item.name +' '+ item.type"
                  :value="item"
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
          <div class="grid grid-cols-12 gap-10">
            <div class="form-group col-span-12" :class="{'form-group__error': v$.card_id.$error}">
              <label for="charge-amount">卡号:</label>
              <el-input
                type="number"
                size="large"
                autocomplete="off"
                id="charge-amount"
                placeholder="请填写银行卡号"
                v-model="v$.card_id.$model"
              />
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.card_id.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-10">
            <div class="form-group col-span-8" :class="{'form-group__error': v$.mobile.$error}">
              <label for="charge-amount">银行预留手机号码:</label>
              <el-input
                type="number"
                autocomplete="off"
                size="large"
                id="charge-amount"
                placeholder="请填写银行预留手机号码"
                v-model="v$.mobile.$model"
              >
                <template #append>
                  <el-button type="success" size="large" class="font-bold"
                             @click="sendMsgCode">
                    {{ nextTime == 0 ? '获取验证码' : nextTime + '秒' }}
                  </el-button>
                </template>
              </el-input>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.mobile.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>
            </div>
            <div class="form-group col-span-4" :class="{'form-group__error': v$.msg_code.$error}">
              <label for="very-code">你的验证码</label>
              <el-input
                type="text"
                size="large"
                autocomplete="off"
                placeholder="请输入你的验证码"
                id="very-code"
                v-model="v$.msg_code.$model"
              />
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.msg_code.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>

            </div>
          </div>
          <div class="grid grid-cols-12 mb-4">
            <div class="col-start-6 col-span-5">
              <label for="very-code">点击进行验证</label>
              <el-checkbox
                v-model="v$.isVerifys.$model"
                @change="handleChange"
                size="large"
                label="验证" border></el-checkbox>
              <VueClicaptcha
                v-if="show" :callback="callback" :src="src"/>
            </div>
          </div>
          <div class=" form-group grid grid-cols-12 mb-4 " :class="{'form-group__error': v$.isVerifys.$error}">
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error col-start-6 col-span-5" v-for="error of v$.isVerifys.$errors"
                 :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="grid grid-cols-12 gap-5">
            <div class="form-group col-span-12" :class="{'form-group__error': v$.password.$error}">
              <label for="very-code">你的密码</label>
              <el-input
                type="password"
                autocomplete="off"
                placeholder="请输入你的密码"
                id="very-code"
                size="large"
                v-model="v$.password.$model"
                :prefix-icon="LockOpenIcon"
              />
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>

            </div>
          </div>
        </form>
        <div class=" px-24 grid grid-cols-1 gap-24 md:grid-cols-2">
          <el-button size="large" type="success" plain class="font-bold" @click="skip">
            关闭
          </el-button>
          <el-button size="large" type="success" @click.prevent="addPayNext">添加</el-button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Radio from '@/components/Radio.vue'
import * as storage from '@/utils/storage'
import useVuelidate from '@vuelidate/core'
import {helpers, required as _required} from '@vuelidate/validators'
import moment from 'moment'
import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'
import {fetchCardlist, postBindcard} from '../../utils/api'
import {getPrivateKey, setCardList} from '../../utils/storage'
import Modal from '../Modal'

const ethers = require('ethers')
import {LockOpenIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'

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
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    }),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  data() {
    return {
      privateKey: '',
      publicKey: '',
      exchangeRate: 10,
      mobile: '',
      card_id: '',
      password: '',
      msg_code: '',
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
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php',
      nextTime: 0,
      hcaptchaResp: null
    }
  },

  validations() {
    return {
      password: [
        helpers.withMessage('请填写密码', _required)
      ],
      mobile: [
        helpers.withMessage('请填写手机号码', _required),
        helpers.withMessage('姓名输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
          return phoneReg.test(v)
        })
      ],
      msg_code: [
        helpers.withMessage('请填写验证码', _required),
        helpers.withMessage('验证码输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^\d{4}$/
          return phoneReg.test(v)
        })
      ],
      card_id: [
        helpers.withMessage('请填写卡号', _required),
        helpers.withMessage('卡号输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^\d{16,19}$/
          return phoneReg.test(v)
        })
      ],
      cardType: [
        helpers.withMessage('请填选择卡类型', _required)
      ],
      isVerifys: [
        helpers.withMessage('请验证!', v => v == true)
      ]
    }
  },

  watch: {},

  async mounted() {
    this.cardType = this.cardTypes[0]
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

      // 这里进行验证码验证
      if (this.nextTime != 0) {
        this.$message.error('当前验证码有效!')
      }
      else if (this.v$.mobile.$invalid) {
        this.$message.error('手机号码输入有误,请重新输入!')
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
      // TODO 这里逻辑暂时需要实现

      this.passwordError = ''
      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await getPrivateKey(this.password, this.walletVersion)

      const wallet = new ethers.Wallet(privateKey)
      const currentTime = Math.floor(Date.now()).toString() // 获取当前时间戳并转换为字符串
      // 使用钱包签名时间戳

      const signature = await wallet.signMessage(currentTime)

      // 验证签名
      const recoveredAddress = ethers.utils.verifyMessage(currentTime, signature)

      postBindcard({
        signature: signature,
        timestamp: currentTime,
        other: {
          msgcode: this.msg_code,
          hcaptchaResp: this.hcaptchaResp
          // hcaptchaResp: {
          //   'info': '95,44-204,84-174,41-56,61;319;200',
          //   'status': true,
          //   'src': 'https://wallet.ctblock.cn/api/clicaptcha.php'
          // }
        },
        // 这里用来存储验证码信息, 包括验证码, 滑块, 等信息
        address: this.address,
        // 这个参数没有用
        mobile: this.mobile,
        card_id: this.card_id,
        card_type: this.cardType.type,
        card_name: this.cardType.name
      }).then(async r => {
        if (r.code == 0) {
          this.$message.success(r.message)

          // TODO 获取支付信息
          const cardList = await fetchCardlist({
            signature: signature,
            timestamp: currentTime
          })
          // console.log('cardList:', cardList)
          setCardList(wallet.address, cardList).then(() => {
            console.log('Object stored successfully!')
            this.reset()
            this.afterCharge()
          }).catch(err => {
            console.error('Failed to store object:', err)
          })
        }
        else {
          this.$message.error(r.message)
        }
      }).catch(r => {
        console.log('catch:', r)
      })
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
      v$: useVuelidate(),
      LockOpenIcon
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
