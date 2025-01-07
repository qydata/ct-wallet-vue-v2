<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="导入一个钱包">
      <v-card-text>
        <v-form validate-on="submit lazy"
                ref="myForm">

          <v-list lines="six">


            <v-list-item
              title="钱包名称"
            >
              <v-text-field
                v-model="walletName"
                :rules="walletNameRules"
                autocomplete="off"
                :prepend-icon="EditPen"
                label="你的钱包名称*"
                :counter="8"

                type="text"
                required
                clearable/>
            </v-list-item>

            <v-list-item
              title="输入私钥"
            >
              <v-text-field
                v-model="privateKey"
                :rules="privateKeyRules"
                autocomplete="off"
                :prepend-icon="KeyIcon"
                label="你的私钥*"
                type="text"
                required
                clearable/>
            </v-list-item>

            <v-list-item
              title="输入密码以加密此会话"
            >
              <v-text-field
                :error-messages="passwordError"
                v-model="password"
                :rules="passwordRules"
                autocomplete="off"
                label="你的密码*"
                :counter="8"

                :type="showPassword ? 'text' : 'password'"
                :prepend-icon="LockOpenIcon"
                :append-icon="showPassword ? EyeIcon : EyeOffIcon"
                @click:append="showPassword = !showPassword"
                required
                clearable/>

            </v-list-item>

            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large"
                         variant="tonal" @click="cancel">返回
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large"
                         @click="restore">导入
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>

          </v-list>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  KeyIcon, LockOpenIcon,
  EyeOffIcon,
  EyeIcon
} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers} from '@vuelidate/validators'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import Modal from '../Modal'
import {Delete, Download, EditPen, Plus, ZoomIn} from '@element-plus/icons-vue'

const ethers = require('ethers')

const ethUtil = require('ethereumjs-util')
const privateKeyRegexp = /^(0x)?[a-fA-F0-9]{64}$/

export default {
  name: 'CreateModal',
  components: {
    KeyIcon,
    EditPen,
    Modal
  },
  props: {
    afterRestore: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      privateKey: '',
      privateKeyRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {
          if (privateKeyRegexp.test(value)) return true
          return '无效的私钥。'
        }
      ],
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      password: '',
      passwordRules: [
        value => {
          if (value) return true
          return '需要密码。'
        },
        value => {
          if (value?.length >= 8) return true
          return '密码必须大于 8 个字符。'
        }
      ],
      passwordError: [],
      walletName: '',
      walletNameRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        }
      ],
      showPassword: false
    }
  },
  validations() {
    return {
      walletName: [
        validation.required
      ],
      privateKey: [
        validation.required,
        helpers.withMessage('Invalid private key.', v => privateKeyRegexp.test(v))
      ],
      password: [
        validation.passwordRequired,
        validation.passwordLength
      ]
    }
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  async mounted() {
    const walletList = await storage.getWalletList(storage.getHighestWalletVersion())

    this.walletName = '账户 ' + (walletList.length + 1)
  },
  watch: {
    visible(newValue) {
      // 当父组件的 prop 更新时，更新本地副本
      this.localVisible = newValue
    },
    localVisible(newValue) {
      // 当本地副本改变时，触发事件通知父组件更新
      this.$emit('update:visible', newValue)
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    reset() {
      this.privateKey = ''
      this.password = ''
      this.v$.$reset()
    },
    async restore() {
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      if (!await this.checkPassword()) return

      let publicKey = ethUtil.privateToPublic(new Buffer(ethUtil.stripHexPrefix(this.privateKey), 'hex'))
      const address = ethUtil.addHexPrefix(ethUtil.publicToAddress(publicKey).toString('hex'))
      if (!await this.checkHasWallet(address)) return
      publicKey = ethUtil.bufferToHex(publicKey)
      await storage.setWallet({privateKey: this.privateKey, publicKey}, this.walletName, this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', address)
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.reset()
      this.afterRestore()
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = []
        return true
      }
      else {
        this.passwordError = ['密码错误.']
        return false
      }
    },
    async checkHasWallet(inAddress) {
      this.v$.password.$reset()

      const walletList = await storage.getWalletList(this.walletVersion)
      let isHas = false
      for (const walletListKey in walletList) {
        const walletItem = walletList[walletListKey]

        const publicKey = walletItem.p1
        const address = ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))

        if (inAddress.toLowerCase() == address.toLowerCase()) {
          isHas = true
          break
        }
      }

      if (isHas) {
        this.passwordError = ['钱包已存在.']
        return false
      }
      else {
        this.passwordError = []
        return true
      }
    },
    restoreOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.restore()
    }
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon,
      KeyIcon,
      EditPen,
      EyeOffIcon,
      EyeIcon
    }
  }
}
</script>
