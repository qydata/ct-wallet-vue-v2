<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="cancel"
            width="97%"
            max-width="36rem"
            v-model="localVisible">

    <v-card title="创建钱包">
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

                type="text"
                required
                clearable/>
            </v-list-item>
            <v-list-item
              title="钱包地址"
              :subtitle="address"
            >
              <template v-slot:append>

                <v-btn variant="text"
                       @click="generateWallet"
                       :icon="RefreshIcon"
                >
                </v-btn>
                <v-btn variant="text"
                       v-if="canCopy" :icon="ClipboardCopyIcon"
                       @click="copyToClipboard(address)"
                >
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item
              title="私钥"
              :subtitle="privateKey"
            >
              <template v-slot:append>
                <v-btn variant="text"
                       v-if="canCopy" :icon="ClipboardCopyIcon"
                       @click="copyToClipboard(privateKey)"
                >
                </v-btn>
              </template>
            </v-list-item>
            <v-banner color="warning" :icon="ShieldExclamationIcon"
                      text="确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了详细信息，您将无法访问您的钱包。请输入您的密码以确认您已备份您的详细信息。">
            </v-banner>
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
                @keypress="createOnEnter"

                :type="showPassword ? 'text' : 'password'"
                :prepend-icon="LockOpenIcon"
                :append-icon="showPassword ? EyeIcon : EyeOffIcon"
                @click:append="showPassword = !showPassword"
                required
                clearable/>

            </v-list-item>

            <v-list-item
            >
              <v-list-item-title>
                请输入 '<span style="color: red">{{
                  phrase
                }}</span>'来确认我已经备份了我的私钥
              </v-list-item-title>
              <v-text-field
                v-model="confirmPhrase"
                :rules="confirmPhraseRules"
                autocomplete="off"
                label=""
                @keypress="createOnEnter"

                type="text"
                required
                clearable/>

            </v-list-item>


            <small class="text-caption text-medium-emphasis">*表示必填字段</small>
            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large"
                         variant="tonal" @click="cancel">返回
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large"
                         @click="create">下一步
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
import * as storage from '@/utils/storage'
import {ClipboardCopyIcon, RefreshIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'

const Web3 = require('web3')
import {LockOpenIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'

const ethUtil = require('ethereumjs-util')
const confirmPhrase = '我确认'
import {EditPen} from '@element-plus/icons-vue'

export default {
  name: 'CreateModal',
  components: {},
  props: {
    afterCreate: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      walletName: '',
      walletNameRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        }
      ],
      address: '',
      privateKey: '',
      publicKey: '',

      password: '',
      showPassword: false,
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
      confirmPhrase: '',
      confirmPhraseRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {
          if (value === confirmPhrase) return true
          return '确认短语不匹配。'
        }
      ],
      canCopy: !!navigator.clipboard,
      phrase: confirmPhrase,

      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible
    }
  },
  computed: {},
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
    async create() {
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (((await storage.getWalletList(storage.getHighestWalletVersion()))).length > 0) {
        if (!await this.checkPassword()) return
      }
      await storage.setWallet({privateKey: this.privateKey, publicKey: this.publicKey}, this.walletName, this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', this.address)
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.reset()
      this.afterCreate()
    },
    async checkPassword() {
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = []
        return true
      }
      else {
        this.passwordError = ['密码错误.']
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
    generateWallet() {
      const web3 = new Web3(this.$store.state.config.blockchain.baseURL)

      // const wallet = ethers.Wallet.createRandom();
      const wallet = web3.eth.accounts.create()
      this.address = wallet.address
      this.privateKey = ethUtil.stripHexPrefix(wallet.privateKey)
      let publicKey = ethUtil.privateToPublic(new Buffer(ethUtil.stripHexPrefix(this.privateKey), 'hex'))
      publicKey = ethUtil.bufferToHex(publicKey)
      this.publicKey = publicKey
    },
    reset() {
      this.generateWallet()
      this.password = ''
      this.confirmPhrase = ''
    }
  },
  async mounted() {
    this.generateWallet()
    const walletList = await storage.getWalletList(storage.getHighestWalletVersion())

    this.walletName = '账户 ' + (walletList.length + 1)
  },
  setup() {
    return {
      LockOpenIcon,
      EditPen, RefreshIcon, ClipboardCopyIcon, ShieldExclamationIcon, EyeIcon, EyeOffIcon
    }
  }
}
</script>

<style scoped>
</style>
