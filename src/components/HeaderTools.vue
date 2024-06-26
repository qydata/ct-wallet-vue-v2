<template>
  <div>
    <button @click.prevent="showTools = !showTools" class="header-tools__expand">
      <span class="pointer-events-none header-tools__icon--cog">
        <CogIcon/>
      </span>
      <span class="pointer-events-none header-tools__icon--expand">
        <ChevronDownIcon/>
      </span>
    </button>
    <ul v-click-outside="onClickOutside" class="header-tools" :class="showTools ? 'showTools' : 'hideTools'">
      <li class="header-tools__item" v-if="false">
        <a href="https://edge.network/en/contact/" class="header-tools__link" target="_blank" rel="noreferrer">
          <span class="header-tools__icon">
            <SupportIcon/>
          </span>
          Support
        </a>
      </li>
      <li class="header-tools__item">
        <div class="header-tools__link" @click="exportKey">
          <span class="header-tools__icon">
            <SortDescendingIcon/>
          </span>
          导出私钥
        </div>
      </li>
      <li class="header-tools__item">
        <div class="header-tools__link" @click="auth">
          <span class="header-tools__icon">
            <UserIcon/>
          </span>
          实名
        </div>
      </li>
      <li class="header-tools__item">
        <div class="header-tools__link" @click="newAccount">
          <span class="header-tools__icon">
            <PlusIcon/>
          </span>
          新建账户
        </div>
      </li>
      <li class="header-tools__item">
        <div class="header-tools__link" @click="importKey">
          <span class="header-tools__icon">
            <SortAscendingIcon/>
          </span>
          导入账户
        </div>
      </li>
      <li class="header-tools__item">
        <div class="header-tools__link" @click="openCard">
          <span class="header-tools__icon">
            <CreditCardIcon/>
          </span>
          我的支付
        </div>
      </li>
      <li class="header-tools__item">
        <div class="header-tools__link" @click="lock">
          <span class="header-tools__icon">
            <LockOpenIcon/>
          </span>
          锁定钱包
        </div>
      </li>
      <li class="header-tools__item" v-if="false">
        <div class="header-tools__link" @click="forget">
          <span class="header-tools__icon">
            <LogoutIcon/>
          </span>
          Forget Wallet
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {
  ChevronDownIcon,
  CogIcon,
  CreditCardIcon,
  LockOpenIcon,
  LogoutIcon,
  PlusIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  UserIcon
} from '@heroicons/vue/outline'
import {SupportIcon} from '@heroicons/vue/solid'
import vClickOutside from 'click-outside-vue3'

export default {
  name: 'HeaderTools',
  components: {
    ChevronDownIcon,
    CogIcon,
    SortAscendingIcon,
    SortDescendingIcon,
    UserIcon,
    PlusIcon,
    LockOpenIcon,
    CreditCardIcon,
    LogoutIcon,
    SupportIcon
  },
  data: function () {
    return {
      showTools: false
    }
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  methods: {
    onClickOutside(event) {
      const target = event.target.className
      if (target !== 'header-tools__expand') {
        this.showTools = false
      }
    },
    forget() {
      this.showTools = false
      this.openForgetWalletModal()
    },
    lock() {
      this.$store.commit('lock')
      this.$router.push('/')
    },
    exportKey() {
      this.showTools = false
      this.openExportKeyModal()
    },
    newAccount() {
      this.showTools = false
      this.openCreateModal()
    },
    auth() {
      this.showTools = false
      this.openAuthBindModal()
    },
    importKey() {
      this.showTools = false
      this.openImportKeyModal()
    },
    openCard() {
      this.showTools = false
      this.openCardModal()
    }
  },
  props: {
    openForgetWalletModal: Function,
    openExportKeyModal: Function,
    openCreateModal: Function,
    openAuthBindModal: Function,
    openImportKeyModal: Function,
    openCardModal: Function
  }
}
</script>

<style scoped>
.header-tools {
  @apply mt-auto px-15 flex-shrink-0;
}

.header-tools.showTools {
  @apply block md:flex;
}

.header-tools.hideTools {
  @apply block md:hidden;
}

.header-tools__expand {
  @apply hidden md:flex items-center text-gray transition-colors hover:text-white;
}

.header-tools__link {
  @apply flex items-center text-gray transition-colors hover:text-white p-12;
}

.header-tools__link--red {
  @apply text-red hover:text-red-500;
}

.header-tools__icon {
  @apply block flex-shrink-0 mr-7 w-16;
}

.header-tools__icon--expand {
  @apply block flex-shrink-0 w-15;
}

.header-tools__icon--cog {
  @apply flex-shrink-0 w-21;
}

@screen md {
  .header-tools {
    @apply flex-col space-y-10 absolute top-40 w-56 right-0 bg-black p-0 rounded flex-wrap mt-2;
  }

  .header-tools__item {
    @apply flex flex-wrap mt-0 w-full border-gray-300 md:border-b border-opacity-25 !important;
  }

  .header-tools__item:last-child {
    @apply border-none;
  }

  .header-tools__link {
    @apply p-16 m-0 w-full;
    cursor: pointer;
  }
}

@screen lg {
  .header-tools {
    /* @apply ml-32; */
  }
}

@screen xl {
  .header-tools {
    /* @apply ml-48; */
  }
}
</style>
