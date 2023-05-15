<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>导出私钥</h2>
    </template>

    <template v-slot:body>
      <form v-if="!privateKey">
        <div class="flex items-start leading-8 text-gray mb-14">
        <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
          <ShieldExclamationIcon/>
        </span>
        <!-- eslint-disable-next-line max-len -->
        <p>在下面输入您的密码以解密并显示您的私钥。 这将使您能够备份您的私钥并在其他浏览器和设备上恢复您的钱包。 不要与其他任何人共享您的私钥，并在您的周围可见时注意您的周围环境。</p>
        </div>
        <!-- eslint-disable-next-line max-len -->
        <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
          <label for="password">输入密码以导出您的私钥</label>
          <div class="relative input-wrap">
            <span class="icon">
              <LockOpenIcon/>
            </span>
            <input
              type="password"
              @keypress="exportOnEnter"
              autocomplete="off"
              placeholder="你的密码"
              id="password"
              v-model="v$.password.$model"
            />
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
          <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
        </div>
      </form>
      <div v-else class="pt-15">
        <div class="form-group">
          <label>钱包地址</label>
          <span class="flex items-center">
            <span class="font-mono break-all text-sm2">{{ address }}</span>
            <button
              class="flex-shrink-0 w-24 ml-24 text-green on-clicked-effect"
              v-if="canCopy"
              @click.prevent="copyToClipboard(address)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>
        </div>
        <div class="form-group mb-25">
          <label>私钥</label>
          <span class="flex items-center">
            <span class="font-mono break-all text-sm2">
              {{ privateKey }}
            </span>
            <button
              class="flex-shrink-0 w-24 text-green ml-18 on-clicked-effect"
              v-if="canCopy"
              @click.prevent="copyToClipboard(privateKey)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <!-- eslint-disable-next-line max-len -->
      <div v-if="!privateKey" class="grid grid-cols-1 gap-24 px-24 pt-24 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-24">
        <button class="w-full button button--outline-success" @click="cancel">返回</button>
        <button class="w-full button button--success" :disabled="!canSubmit" @click="exportKey">导出</button>
      </div>
      <!-- eslint-disable-next-line max-len -->
      <div v-else class="grid grid-cols-1 gap-24 px-24 pt-20 border-gray-700 border-solid border-t-default border-opacity-30 pb-20">
        <button
          :disabled="!canSubmit"
          @click="cancel"
          class="block w-full mx-auto text-center button button--success md:w-1/2"
        >完成</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import Modal from '../Modal.vue'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { ClipboardCopyIcon, LockOpenIcon, ShieldExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'ExportKey',
  components: {
    ClipboardCopyIcon,
    LockOpenIcon,
    Modal,
    ShieldExclamationIcon
  },
  data() {
    return {
      password: '',
      passwordError: '',
      privateKey: '',
      canCopy: !!navigator.clipboard
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  props: {
    close: Function,
    visible: Boolean
  },
  computed: {
    ...mapState(['address']),
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
      this.password = ''
      this.privateKey = ''
      this.passwordError = ''
      this.v$.$reset()
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    async exportKey() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return

      this.privateKey = await storage.getPrivateKey(this.password)
    },
    exportOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.exportKey()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('Clipboard unavailable. Please copy-paste manually.')
      return navigator.clipboard.writeText(input)
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
