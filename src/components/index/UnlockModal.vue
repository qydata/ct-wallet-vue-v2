<template>
  <Modal :close="close" :visible="visible">
    <template v-slot:header>
      <h2>解锁钱包</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div class="form-group">
            <label>钱包地址</label>
            <span class="break-all">{{ address }}</span>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group"
               :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <label for="password">输入密码</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="unlockOnEnter"
                autocomplete="off"
                placeholder="你的密码"
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
        </form>
      </div>
    </template>

    <template v-slot:footer>
      <!-- eslint-disable-next-line max-len -->
      <!--      class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100">-->
      <div
        class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100">
        <button
          class="w-full border-red-600 button button--outline-success hover:border-red-600 hover:bg-red-600"
          @click="switchToForgetModal"
        >
          忘记钱包
        </button>
        <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="unlock">解锁</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import {LockOpenIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import Modal from '../Modal'

export default {
  name: 'CreateModal',
  components: {
    LockOpenIcon,
    Modal
  },
  data() {
    return {
      password: '',
      passwordError: ''
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  props: {
    afterUnlock: Function,
    close: Function,
    switchToForgetModal: Function,
    visible: Boolean
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
  methods: {
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
    async unlock() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return

      const privateKey = await storage.getPrivateKey(this.password, this.walletVersion)
      const publicKey = await storage.getPublicKey(this.walletVersion)
      const walletName = await storage.getWalletName(this.walletVersion)

      // do not specify wallet version here - this forces migration to highest version
      await storage.setWallet({privateKey, publicKey}, walletName, this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.afterUnlock()
    },
    unlockOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.unlock()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
