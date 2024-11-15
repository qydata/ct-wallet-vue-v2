<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>导入一个钱包</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div class="form-group" :class="{'form-group__error': v$.privateKey.$error}">
            <label for="walletName">钱包名称</label>
            <div class="relative input-wrap">
              <el-input
                size="large" type="text" placeholder="请输入一个钱包名称" id="walletName"
                v-model="v$.walletName.$model"
                :prefix-icon="EditPen"/>
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.walletName.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>

          <div class="form-group" :class="{'form-group__error': v$.privateKey.$error}">
            <label for="key">输入私钥</label>
            <div class="relative input-wrap">
              <el-input
                size="large" type="password" placeholder="你的私钥" id="key" v-model="v$.privateKey.$model"
                :prefix-icon="KeyIcon"/>
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.privateKey.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>

          <div class="form-group" :class="{'form-group__error': v$.password.$error}">
            <label for="password">输入密码</label>
            <div class="relative input-wrap">
              <el-input
                size="large"
                type="password"
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

        </form>
      </div>
    </template>

    <template v-slot:footer>
      <!-- eslint-disable-next-line max-len -->
      <div
        class="grid grid-cols-1 gap-24 px-24 pt-48 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-54">
        <button class="w-full button button--outline-success" @click="cancel">返回</button>
        <button class="w-full button button--success" :disabled="!canSubmit" @click="restore">导入</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import {KeyIcon, LockOpenIcon} from '@heroicons/vue/outline'
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

      password: '',
      passwordError: '',
      walletName: ''
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
      if (!await this.v$.$validate()) return
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
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
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
        this.passwordError = '钱包已存在.'
        return false
      }
      else {
        this.passwordError = ''
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
      EditPen
    }
  }
}
</script>
