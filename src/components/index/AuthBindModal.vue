<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>实名绑定</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
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
      <div class="px-24 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
        <el-form>
          <div class="flex items-start leading-8 text-gray mb-14">
          <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
            <p>确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了您的详细信息，您
              将无法访问您的钱包。请输入您的密码以确认您有
              备份您的详细信息。</p>
          </div>

          <div class="form-group" :class="{'form-group__error': v$.mobile.$error}">
            <label>你的手机号码</label>
            <el-input
              type="text"
              size="large"
              autocomplete="off"
              placeholder="请输入你的手机号码"
              id="tel-number"
              v-model="v$.mobile.$model"
            >
              <template #suffix>
                <button class="mx-auto button button--success" type="button" @click.prevent="sendMsgCode">
                  {{ nextTime == 0 ? '获取验证码' : nextTime + '秒' }}
                </button>
              </template>
            </el-input>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.mobile.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>

          </div>

          <div class="grid grid-cols-12 gap-5">
            <div class="col-span-3">

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
            <div class="form-group col-span-9" :class="{'form-group__error': v$.msgCode.$error}">
              <label for="very-code">你的验证码</label>
              <input
                type="text"
                autocomplete="off"
                placeholder="请输入你的验证码"
                id="very-code"
                v-model="v$.msgCode.$model"
              />
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.msgCode.$errors" :key="error.$uid">
                {{ error.$message }}
              </div>

            </div>
          </div>

          <div class="form-group" :class="{'form-group__error': v$.realName.$error}">
            <label for="real-name">你的姓名</label>
            <input
              type="text"
              autocomplete="off"
              placeholder="请输入你的姓名"
              id="real-name"
              v-model="v$.realName.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.realName.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>

          </div>
          <div class="form-group" :class="{'form-group__error': v$.idCard.$error}">
            <label for="id-card">你的证件号码</label>
            <input
              type="text"
              autocomplete="off"
              placeholder="请输入你的证件号码"
              id="id-card"
              v-model="v$.idCard.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.idCard.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>

          </div>
          <div class="form-group" :class="{'form-group__error': v$.password.$error}">
            <label for="password">输入密码以加密此会话</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="createOnEnter"
                autocomplete="off"
                placeholder="输入你的密码"
                id="password"
                v-model="v$.password.$model"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{ passwordError }}
            </div>
          </div>
        </el-form>

        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">

          <button v-if="isInIframe() === false" class="w-full button button--outline-success" @click="skip">跳过
          </button>
          <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">下一步</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
const EIP712 = require('@/contract/EIP712')
const sigUtil = require('eth-sig-util')
import {queryCert, sendTelCode, userCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'

import {ClipboardCopyIcon, LockOpenIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers, required as _required} from '@vuelidate/validators'

import VueClicaptcha from 'vue-clicaptcha'
import Modal from '../Modal'

const {contract_static_call, contract_gas_call_override, contract_call_override} = require('../../contract/ChainCall')
const ABI_const = require('@/contract/ABI_const.js')
const GlobalConfig = require('@/config/GlobalConfig.json')
const ethers = require('ethers')
const Web3 = require('web3')

const ElementPlus = {
  Message: {
    error: (info) => {
      console.log(info)
      alert(info)
      // this.passwordError = info
    },
    success: (info) => {
      console.log(info)
      alert(info)
    }
  }
}
const ethUtil = require('ethereumjs-util')
export default {
  name: 'AuthBindModal',
  components: {
    ClipboardCopyIcon,
    LockOpenIcon,
    Modal,
    ShieldExclamationIcon,
    VueHcaptcha,
    VueClicaptcha
  },
  props: {
    afterAuthBind: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      // src: 'http://127.0.0.1:8000/clicaptcha.php',
      src: 'https://wallet.ctblock.cn/api/clicaptcha.php',
      show: false,
      address: '',
      privateKey: '',
      publicKey: '',
      isVerifys: false,
      password: '',
      passwordError: '',
      canCopy: !!navigator.clipboard,
      // AUTH
      mobile: '',
      realName: '',
      idCard: '',
      msgCode: '',
      nextTime: 0,
      hcaptchaResp: null
    }
  },

  validations() {
    return {
      password: [
        validation.passwordRequired,
        validation.passwordLength
      ],
      realName: [
        helpers.withMessage('请输入你的姓名', _required),
        helpers.withMessage('姓名输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const str = v.substr(0, 1)
          const surname = ' 赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤 滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董粱杜阮蓝闵席季麻强贾路娄危江童颜郭 梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗宣丁贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄魏加封芮羿储靳汲邴糜松 井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘姜詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥能苍双 闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庚终暨居衡步都耿满弘匡国文寇广禄阙东 殴殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊 澹台公冶宗政濮阳淳于仲孙太叔申屠公孙乐正轩辕令狐钟离闾丘长孙慕容鲜于宇文司徒司空亓官司寇仉督子车颛孙端木巫马公西漆雕乐正壤驷公良拓拔夹谷宰父谷粱 晋楚闫法汝鄢涂钦段干百里东郭南门呼延妫海羊舌微生岳帅缑亢况後有琴梁丘左丘东门西门商牟佘佴伯赏南宫墨哈谯笪年爱阳佟第五言福'
          // 查找字符串。
          const r = surname.search(str)
          if (r == -1) {
            return false
          }
          else {
            return true
          }

        })
      ],
      mobile: [
        helpers.withMessage('请输入你的手机号码', _required),
        helpers.withMessage('姓名输入有误,请重新输入!', v => {

          //截取用户提交的用户名的前两字节，也就是姓。
          const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
          return phoneReg.test(v)
        })
      ],
      msgCode: [
        helpers.withMessage('请输入验证码', _required)
      ],
      idCard: [
        helpers.withMessage('请输入你的证件号码', _required),
        helpers.withMessage('证件号码输入有误,请重新输入!', value => {

          // 只能是18位
          if (!value || value.length != 18) {
            return false
          }

          // 取出本体码
          const idcard_base = value.substr(0, 17)
          // 取出校验码
          const verify_code = value.substr(17, 1)
          // 加权因子
          const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
          // 校验码对应值
          const verify_code_list = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

          // 根据前17位计算校验码
          let total = 0

          for (let i = 0; i < 17; i++) {
            total += idcard_base.substr(i, 1) * factor[i]
          }
          // 取模
          const mod = total % 11
          // 比较校验码
          if (verify_code != verify_code_list[mod]) {
            return false
          }
          else {
            return true
          }
        })
      ]
    }
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    isInIframe() {
      if (window.self !== window.top) {
        console.log('这个网页是在 iframe 中加载的。')
        return true
      }
      else {
        console.log('这个网页不是在 iframe 中加载的。')
        return false
      }
    },

    handleChange() {
      this.show = true
    },
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
    preparAuth() {

      const that = this

      const orderId = new Date().getTime()
      const orderIdEcc = `0x${ethUtil
        .keccak256(Buffer.from(orderId + ''))
        .toString('hex')}`

      const AUTH_CONTROLLER_SYSTEM_ADDRESS = GlobalConfig.AUTH_CONTROLLER_SYSTEM_ADDRESS
      // 判断用户密码是否正确
      // 判断接入方用户名密码

      const c_wallet = new ethers.Wallet(this.privateKey, that.customHttpProvider)
      const contractAddress = GlobalConfig.AUTH_CONTROLLER_ADDRESS
      // TODO 这里新建一张表来存储上链信息 , 这里需要使用到签名
      //等待其它程序处理上链
      const sender = AUTH_CONTROLLER_SYSTEM_ADDRESS
      const authTime = 1766841499 // 没有用的参数
      const authExpiry = Date.now() + 1 * 60 * 60 * 24 * 180 // 六个月
      const isAuth = true
      const authLevel = 2 // 机构下面用户认证使用2, 机构实名使用1
      const expandData = '{hash: \\"\\", version: \\"v0.0.0\\"}'
      console.log(expandData)
      const caddress = c_wallet.address
      // 计算签名
      const auth = {
        caddress,
        sender,
        authTime,
        authExpiry,
        isAuth,
        authLevel,
        expandData
      }

      let privateKeyStr = c_wallet.privateKey
      const verifyingContract = contractAddress
      privateKeyStr = ethUtil.stripHexPrefix(privateKeyStr)
      const privateKey = Buffer.from(privateKeyStr, 'hex')

      const Types = {
        Authentication: [
          {type: 'uint256', name: 'orderId'},
          {type: 'address', name: 'caddress'},
          {type: 'address', name: 'sender'},
          {type: 'bool', name: 'isAuth'}
        ]
      }

      const data = EIP712.createTypeData(
        {
          name: 'Authentication',
          version: '1',
          chainId: '27',
          verifyingContract
        },
        'Authentication',
        {
          orderId: orderIdEcc,
          caddress: auth.caddress,
          sender: auth.sender,
          isAuth: auth.isAuth
        },
        Types
      )

      const signature = sigUtil.signTypedData_v4(privateKey, {data: data})
      auth.signature = signature

      const origin_data_json = [auth, orderIdEcc]
      const preparData = {
        from: AUTH_CONTROLLER_SYSTEM_ADDRESS,
        to: contractAddress,
        status: 0,
        // "hash": "",
        // "block_number": "",
        type: 1,
        is_reback: 0,
        order_id: orderId,
        value: '0',
        // "origin_data": JSON.stringify(origin_data_json),
        origin_data: origin_data_json,
        contract_address: contractAddress,
        method:
          ABI_const['AuthController'].contractName +
          '#' +
          'authentication'
      }

      return preparData
    },
    cancel() {
      this.reset()
      this.close()
    },
    onVerify(response) {
      // 处理验证响应
      // console.log('hCaptcha verification response:', response)
      this.hcaptchaResp = response
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
        sendTelCode({tel: this.mobile, hcaptcha: this.hcaptchaResp}).then(res => {
          console.log(res)
          if (res.code !== 1) {
            this.$message.error(res.msg)
          }
          else {
            this.$message.success('发送成功!')
            // 开始短信倒计时
            this.nextTime = 60
            this.countTime()

          }
        }).catch((e) => {
          console.trace(e)
          this.$message.error('网络请求失败')
        })
      }
    },
    countTime() {
      this.nextTime = this.nextTime - 1
      if (this.nextTime == 0) {
        return
      }
      window.setTimeout(this.countTime, 1000)
    },
    skip() {
      this.reset()
      this.close()
    },
    async create() {
      if (!await this.v$.$validate()) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (!await this.checkPassword()) return

      const privateKey = await storage.getPrivateKey(this.password)

      // 调用后台实名
      // 首先查询地址是否已经认证
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const authContractAddress = GlobalConfig.AUTH_CONTROLLER_ADDRESS
      this.privateKey = ethUtil.stripHexPrefix(privateKey)
      const publicKey = ethUtil.privateToPublic(
        new Buffer(this.privateKey, 'hex')
      )
      const address = ethUtil.addHexPrefix(ethUtil.publicToAddress(publicKey).toString('hex'))
      const isAuth = await contract_static_call(
        ethers,
        authContractAddress,
        ABI_const['AuthController'].abi,
        'authsSingle',
        customHttpProvider,
        [address]
      )
      if (isAuth.data == true) {
        this.$message.error('账户已经认证!')
      }
      else {
        // 以太币转账
        // 先获取当前账号交易的nonce
        console.log(address)
        queryCert({address: address}).then((res) => {
          console.log(res)
          if (res.code !== 200) {
            this.$message.error(res.msg)
          }
          else {
            if (res.is_cert) {
              this.showCertModal = false
              this.$message.success('账户已经认证!')
              return
            }
            this.sec_data = res.sec_data
            const paramSha3 = Web3.utils.sha3(this.sec_data, {encoding: 'hex'})
            const privateBuffer = Buffer.from(this.privateKey, 'hex')
            // console.log("paramSha3:", paramSha3)
            const ecsign = ethUtil.ecsign(Buffer.from(Web3.utils.hexToBytes(paramSha3)), privateBuffer)
            console.log('R', ethUtil.bufferToHex(ecsign.r))
            console.log('S', ethUtil.bufferToHex(ecsign.s))
            console.log('V', ethUtil.bufferToHex(ecsign.v))
            let sign = ethUtil.bufferToHex(ecsign.r) + ethUtil.bufferToHex(ecsign.s) + ethUtil.bufferToHex(ecsign.v)
            sign = sign.replace(new RegExp('0x', 'gm'), '')
            console.log(sign)

            // 生成上链预实名数据
            const preparData = this.preparAuth()
            console.log('preparData:', preparData)
            userCert({
              cert_name: this.realName,
              cert_id_number: this.idCard,
              mobile: this.mobile,
              sign: sign,
              msg: this.sec_data,
              msg_code: this.msgCode,
              prepar_data: preparData
            }).then((res) => {
              console.log(res)
              if (res.code !== 200) {
                this.$message.error(res.msg)
              }
              else {
                this.is_cert = res.is_cert
                this.sec_data = res.sec_data
                this.$message.success('认证成功!')

                this.reset()
                this.afterAuthBind()
              }
            }).catch(() => {
              this.$message.error('网络请求失败')
            })
          }
        })
      }
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
      this.mobile = ''
      this.realName = ''
      this.msgCode = ''
      this.idCard = ''
      this.v$.$reset()
    }
  },
  async mounted() {
    this.address = await storage.getAddress(storage.getHighestWalletVersion())
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
