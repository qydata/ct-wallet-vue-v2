<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>导入钱包</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div class="form-group" :class="{'form-group__error': v$.privateKey.$error}">
            <label for="key">输入私钥</label>
            <div class="relative input-wrap">
              <span class="icon">
                <KeyIcon/>
              </span>
              <input type="password" placeholder="你的私钥" id="key" v-model="v$.privateKey.$model"/>
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.privateKey.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
          </div>

          <div class="form-group" :class="{'form-group__error': v$.password.$error || v$.repeatPassword.$error}">
            <label for="password">输入密码</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
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

            <label for="repeat-password" class="mt-10">确认密码</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="restoreOnEnter"
                autocomplete="off"
                placeholder="重复你的密码"
                id="repeat-password"
                v-model="v$.repeatPassword.$model"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.repeatPassword.$errors" :key="error.$uid">
              {{ error.$message }}
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
import {helpers, sameAs} from '@vuelidate/validators'
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import Modal from '../Modal'

const ethers = require('ethers')

const ethUtil = require('ethereumjs-util')
const privateKeyRegexp = /^[a-fA-F0-9]{64}$/

export default {
  name: 'CreateModal',
  components: {
    KeyIcon,
    LockOpenIcon,
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
      repeatPassword: ''
    }
  },
  validations() {
    return {
      privateKey: [
        validation.required,
        helpers.withMessage('Invalid private key.', v => privateKeyRegexp.test(v))
      ],
      password: [
        validation.passwordRequired,
        validation.passwordLength
      ],
      repeatPassword: [
        helpers.withMessage('Passwords do not match.', sameAs(this.password))
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
    reset() {
      this.privateKey = ''
      this.password = ''
      this.repeatPassword = ''
      this.v$.$reset()
    },
    async restore() {
      if (!await this.v$.$validate()) return

      let publicKey = ethUtil.privateToPublic(new Buffer(ethUtil.stripHexPrefix(this.privateKey), 'hex'))
      const address = ethUtil.addHexPrefix(ethUtil.publicToAddress(publicKey).toString('hex'))

      publicKey = ethUtil.bufferToHex(publicKey)
      await storage.setWallet({privateKey: this.privateKey, publicKey}, '账户1', this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', address)
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.afterRestore()
    },
    restoreOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.restore()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
