<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>创建钱包</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">

        <div class="form-group" :class="{'form-group__error': v$.walletName.$error}">
          <label for="walletName">钱包名称</label>
          <div class="relative input-wrap">
            <el-input
              size="large"
              type="text"
              autocomplete="off"
              placeholder="请输入一个钱包名称"
              id="walletName"
              v-model="v$.walletName.$model"
              :prefix-icon="EditPen"
            />
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-for="error of v$.walletName.$errors" :key="error.$uid">
            {{ error.$message }}
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-if="passwordError && !v$.walletName.$dirty">{{ passwordError }}
          </div>
        </div>

        <div class="form-group">
          <label>钱包地址</label>
          <span class="flex items-center">
            <span class="font-mono break-all text-sm2">{{ address }}</span>
            <button
              class="flex-shrink-0 w-20 ml-24 text-green on-clicked-effect"
              v-on:click.prevent="generateWallet"
            >
              <RefreshIcon/>
            </button>
            <button
              class="flex-shrink-0 w-24 ml-24 text-green on-clicked-effect"
              v-if="canCopy"
              @click="copyToClipboard(address)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>
        </div>
        <div class="form-group mb-25">
          <label>私钥</label>
          <span class="flex items-center">
            <span class="private-key font-mono break-all text-sm2">
              {{ privateKey }}
            </span>
            <button
              class="flex-shrink-0 w-24 text-green ml-18 on-clicked-effect"
              v-if="canCopy"
              @click="copyToClipboard(privateKey)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
        <form>
          <div class="flex items-start leading-8 text-gray mb-14">
          <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
            <p>确保您安全地复制和存储您的钱包地址和密钥。如果您丢失了详细信息，您将无法访问您的钱包。请输入您的密码以确认您已备份您的详细信息。</p>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.password.$error}">
            <label for="password">输入密码以加密此会话</label>
            <div class="relative input-wrap">

              <el-input
                size="large"
                type="password"
                @keypress="createOnEnter"
                autocomplete="off"
                placeholder="输入你的密码"
                id="password"
                v-model="v$.password.$model"
                :prefix-icon="LockOpenIcon"
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
          <div class="form-group" :class="{'form-group__error': v$.confirmPhrase.$error}">
            <label for="confirm-phrase">请输入 '<span style="text-transform: none">{{
                phrase
              }}</span>'来确认我已经备份了我的私钥</label>
            <el-input
              size="large"
              type="text"
              @keypress="createOnEnter"
              autocomplete="off"
              id="confirm-phrase"
              v-model="v$.confirmPhrase.$model"
            />
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.confirmPhrase.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>

          </div>
        </form>
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="cancel">返回</button>
          <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">下一步</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import {ClipboardCopyIcon, LockOpenIcon, RefreshIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {helpers, required as _required} from '@vuelidate/validators'
import Modal from '../Modal'

const ethers = require('ethers')
const Web3 = require('web3')

const ethUtil = require('ethereumjs-util')
const confirmPhrase = '我确认'
const matchConfirmPhrase = validation.caseInsensitive(confirmPhrase, '确认短语不匹配。')
import {Delete, Download, EditPen, Plus, ZoomIn} from '@element-plus/icons-vue'

export default {
  name: 'CreateModal',
  components: {
    ClipboardCopyIcon,
    Modal,
    RefreshIcon,
    ShieldExclamationIcon
  },
  props: {
    afterCreate: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      walletName: '',
      address: '',
      privateKey: '',
      publicKey: '',

      password: '',
      confirmPhrase: '',
      passwordError: '',
      canCopy: !!navigator.clipboard,
      phrase: confirmPhrase
    }
  },
  validations() {
    return {
      walletName: [
        helpers.withMessage('需要一个值。', _required)
      ],
      password: [
        validation.passwordRequired,
        validation.passwordLength
      ],
      confirmPhrase: [
        validation.required,
        matchConfirmPhrase
      ]
    }
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    async create() {
      if (!await this.v$.$validate()) return
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
      this.v$.$reset()
    }
  },
  async mounted() {
    this.generateWallet()
    let walletList = await storage.getWalletList(storage.getHighestWalletVersion())

    this.walletName = '账户 ' + (walletList.length + 1)
  },
  setup() {
    return {
      v$: useVuelidate(),
      LockOpenIcon,
      EditPen
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
