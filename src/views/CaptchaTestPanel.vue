<template>
  <div class="account-panel">
<!--    <VueHcaptcha :tabindex="tabindex" sitekey="a0bce798-5c05-4ab9-96ae-d15863e4e5fa" @verify="onVerify"></VueHcaptcha>-->
    <VueClicaptcha
      v-if="show" :callback="callback" :src="src"/>
  </div>
</template>

<script>
// import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'
// import VueClicaptch from 'vue-clicaptcha'
import VueClicaptcha from 'vue-clicaptcha'
import {mapState} from 'vuex'

export default {
  name: 'CaptchaTestPanel',
  props: ['view'],
  components: {
    // VueHcaptcha,
    VueClicaptcha

  },
  computed: mapState(['address', 'balance', 'cnyBalance']),
  data() {
    return {
      // src: 'http://127.0.0.1:8000/clicaptcha.php',
      // src: 'https://manager.ctblock.cn/api/clicaptcha.php',
      src: 'http://127.0.0.1:8000/clicaptcha.php',
      show: true,
      modal: '',
      tabindex: '0',
      walletName: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {}
    }
  },
  watch: {},
  mounted() {
    let that = this
    window.setTimeout(() => {
      that.tabindex = '1'
    }, 5000)
  },
  methods: {
    callback() {
      alert('yes')
    },
    onVerify(response) {
      // 处理验证响应
      console.log('hCaptcha verification response:', response)
    }
  }
}

</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__balance h3 {
  @apply text-green mb-5;
}

.account-panel__balance h2 {
  @apply text-gray-300 text-md mb-0;
}

.account-panel__balance h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__buttons.staking-buttons > button {
    width: 170px;
  }

}
</style>
