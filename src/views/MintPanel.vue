<template>
  <div class="account-panel">
    <VueHcaptcha :tabindex="tabindex" sitekey="a0bce798-5c05-4ab9-96ae-d15863e4e5fa" @verify="onVerify"></VueHcaptcha>
  </div>
</template>

<script>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'
import {mapState} from 'vuex'

export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    VueHcaptcha

  },
  computed: mapState(['address', 'balance', 'usdBalance']),
  data() {
    return {
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

.account-panel__left,
.account-panel__right {
  @apply w-full;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7 w-full;
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

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

#walletName {
  padding-left: 0;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

.account-panel__modals {
  width: 1px;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

  .account-panel__buttons.staking-buttons {
    @apply grid-cols-1;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__buttons.staking-buttons > button {
    width: 170px;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}
</style>
