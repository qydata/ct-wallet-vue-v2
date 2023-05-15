<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>加载中</h2>
      <body>
      <div class="loading">
        <span style="--i: 0;"></span>
        <span style="--i: 2;"></span>
        <span style="--i: 4;"></span>
        <span style="--i: 6;"></span>
        <span style="--i: 8;"></span>
        <span style="--i: 10;"></span>
        <span style="--i: 12;"></span>
        <span style="--i: 14;"></span>
        <span style="--i: 16;"></span>
        <span style="--i: 18;"></span>
      </div>
      </body>

    </template>

  </Modal>
</template>

<script>
import {ClipboardCopyIcon, LockOpenIcon, RefreshIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'
import useVuelidate from '@vuelidate/core'
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import Modal from '../Modal'

const ethers = require('ethers')
const Web3 = require('web3')

const ethUtil = require('ethereumjs-util')

export default {
  name: 'CreateModal',
  components: {
    ClipboardCopyIcon,
    LockOpenIcon,
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
      address: '',
      privateKey: '',
      publicKey: '',

      password: '',
      passwordError: '',
      canCopy: !!navigator.clipboard
    }
  },
  validations() {
    return {
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
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    async create() {
      if (!await this.v$.$validate()) return
      // 判断 如果已经存在第一个钱包, 就进行密码验证
      if (!await this.checkPassword()) return

      // 发送消息
      this.afterCreate(this.password)
      this.password = ''
      this.v$.$reset()
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
      if (!this.canCopy) window.alert('Clipboard unavailable. Please copy-paste manually.')
      return navigator.clipboard.writeText(input)
    },
    reset() {
      this.password = ''
      this.confirmPhrase = ''
      this.v$.$reset()
    }
  },
  async mounted() {

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

body {
  padding: 0;
  margin: 0;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading {
  width: 50px;
  height: 50px;
  position: relative;
}

.loading > span {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(calc(var(--i) * 18deg));
}

.loading > span::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff;
  animation: breath 2s linear infinite;
  animation-delay: calc(var(--i) * 0.1s);
}

@keyframes breath {
  0% {
    transform: scale(0);
  }
  10% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(0);
  }
}

</style>
