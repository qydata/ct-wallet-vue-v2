<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>充值</h2>
    </template>

    <template v-slot:footer>
      <div class="pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
        <form class="px-24 ">
          <div class="flex items-start leading-8 text-gray mb-14">
          <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
            <p>确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了您的详细信息，您
              将无法访问您的钱包。请输入您的密码以确认您有
              备份您的详细信息。</p>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.toaddress.$error}">
            <label for="charge-address">充值至地址:</label>
            <input
              type="text"
              readonly
              autocomplete="off"
              id="charge-address"
              placeholder="请输入地址"
              v-model="v$.toaddress.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.toaddress.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.tovalue.$error}">
            <label for="charge-amount">充值金额:</label>
            <input
              type="number"
              autocomplete="off"
              id="charge-amount"
              placeholder="请填写充值金额"
              v-model="v$.tovalue.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.tovalue.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              汇率
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`最后更新 ${timeSince(new Date().getTime())}`">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            1 ￥ = {{ exchangeRate }} 草田分
          </div>

        </form>
        <div class="px-24 pt-12 border-t border-gray-700 border-opacity-30">
          <div
            class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="md:flex">
              <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">您正在充值</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="Number(tovalue)" currency="CNY" :decimalPlaces="2"/>
                  </span>
                </div>
                <!-- eslint-disable-next-line max-len -->
                <span
                  class="flex justify-center  bg-white p-8   mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
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
                  class="bg-white flex justify-center p-8 mx-auto mb-12 border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                  <img src="/assets/logo.svg" alt="image description" class="flex-shrink-0">
                </span>
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">您将收到</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="Number(tovalue)*exchangeRate" currency="草田分"/>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class=" px-24 grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="skip">
            {{
              // label == 'header' ? '跳过' : '关闭'
              label == 'accountPanel' ? '关闭' : '跳过'
            }}

          </button>
          <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">下一步</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Amount from '@/components/Amount.vue'
import Tooltip from '@/components/Tooltip.vue'
import {putChangeReq, queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers, required as _required} from '@vuelidate/validators'
import {mapState} from 'vuex'
import Modal from '../Modal'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import moment from 'moment'
import {ArrowDownIcon, ArrowRightIcon, LockOpenIcon} from '@heroicons/vue/outline'

export default {
  name: 'AuthBindModal',
  components: {
    Tooltip,
    Amount,
    Modal,
    ShieldExclamationIcon,
    InformationCircleIcon,
    ArrowDownIcon,
    ArrowRightIcon
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
      canCopy: !!navigator.clipboard
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
  },
  methods: {
    timeSince(ts) {
      return moment(ts).fromNow()
    },
    cancel() {
      this.reset()
      this.close()
    },
    skip() {
      if(this.label == 'accountPanel') {
        this.cancel()
      }
      else {
        this.reset()
        this.afterCharge()
      }
    },
    async create() {
      if (!await this.v$.$validate()) return
      this.address = await storage.getAddress(storage.getHighestWalletVersion())
      // 判断实名情况
      queryCert({address: this.address}).then((res) => {
        if (res.code !== 200) {
          this.$message.error(res.msg)
        }
        else {
          if (res.is_cert) {
            // this.$message.success('账户已经认证!')

            let data = {
              charge_amount: this.tovalue,
              address: this.toaddress
            }
            putChangeReq(data).then((res) => {
              if (res.code !== 200) {
                this.$message.error(res.msg)
              }
              else {
                console.log(res)
                this.payCodeDialog = true
                this.order_id = res.order_id
                this.reset()
                this.afterCharge(res)
              }
            })

          }
          else {
            this.$message.success('账户未认证!')
          }

        }
      })
        .catch(() => {
          this.$message.error('网络请求失败')
        })


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
