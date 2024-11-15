<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>我的支付方式</h2>
    </template>

    <template v-slot:footer>
      <div class="pt-48 border-gray-700 border-solid border-t-default border-opacity-30">
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
                     :selected="payType === items"
                     @click="setStakeType(items)"
              />
            </div>
          </div>

          <div class="grid grid-cols-12 gap-4 pb-10 mt-10">
            <el-card class="col-span-4" shadow="always"
                     v-for="(items, index) in cardTypeArr" v-bind:key="index">

              <div class="text-md  py-4 text-sm">
                <el-tooltip class="box-item" effect="dark" :content="items.card_name+'('+items.card_type+')'"
                            placement="right-end">
                  <el-icon class=" mb-1 align-middle">
                    <InfoFilled/>
                  </el-icon>
                </el-tooltip>
                {{ items.card_name }} ({{ items.card_type }})
              </div>
              <div class="text-sm col-span-5 py-4 overflow-hidden overflow-ellipsis">
                {{ items.card_id }}
              </div>
            </el-card>
          </div>
        </form>
        <el-divider/>
        <div class="my-30 px-24 grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="skip">
            关闭
          </button>
          <button class="w-full button button--success" @click.prevent="addPay">添加支付方式</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Radio from '@/components/Radio.vue'
import * as storage from '@/utils/storage'
import {InfoFilled} from '@element-plus/icons-vue'
import {ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {required as _required, helpers} from '@vuelidate/validators'
import moment from 'moment'
import {mapState} from 'vuex'
import {getCardList} from '../../utils/storage'
import Modal from '../Modal'

export default {
  name: 'AuthBindModal',
  components: {
    Radio,
    Modal,
    InfoFilled,
    ShieldExclamationIcon
  },
  props: {
    afterCharge: Function,
    close: Function,
    showAddPay: Function,
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
      cardTypeArr: [
        // {name: '建设银行', value: '****5678'},
        // {name: '农业银行', value: '****5679'},
        // {name: '中信银行', value: '****5670'}
      ]
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
      console.log(newVal, oldVal)
    },
    async visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.toaddress = this.address
        this.payType = this.payTypeArr[0]
        // console.log(this.toaddress)
        const cardList = await getCardList(this.toaddress)
        console.log(cardList)
        if (cardList) {
          this.cardTypeArr = cardList['card_lists']
        }
      }
    }
  },
  async mounted() {
  },
  methods: {

    setStakeType(type) {
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
    async addPay() {
      this.showAddPay()
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
