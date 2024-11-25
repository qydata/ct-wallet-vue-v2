<template>
  <div>
    <div @click="handleClick" class="header-tools__expand cursor-pointer">
      <span class="header-tools__icon--users">
        <UsersIcon/>
      </span>
      <span class="ml-4">
        切换账户
      </span>
      <span class="header-tools__icon--users">
        <ChevronDownIcon/>
      </span>
    </div>
    <ul v-if="showTools" v-click-outside="onClickOutside" class="header-tools">
      <li class="header-tools__item w-fit" v-for="(item, index) in walletList" :key="index">
        <div class="header-tools__link w-fit" @click="switchAccount(item)">
          <span class="header-tools__icon">
            <KeyIcon :class="address.toLowerCase() == publicKeyToAddress(item.p1).toLowerCase() && 'green'"/>
          </span>
          <el-text line-clamp="2" class="w-full overflow-ellipsis overflow-hidden whitespace-nowrap">
            {{ item.walletName }} <br/>
            {{ publicKeyToAddress(item.p1) }}
          </el-text>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import * as storage from '@/utils/storage'
import {ChevronDownIcon, KeyIcon, UsersIcon} from '@heroicons/vue/outline'
import vClickOutside from 'click-outside-vue3'

const ethUtil = require('ethereumjs-util')

export default {
  name: 'WalletList',
  components: {
    ChevronDownIcon,
    UsersIcon,
    KeyIcon
  },
  data: function () {
    return {
      showTools: false,
      address: '',
      walletList: []
    }
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  watch: {
    async showTools(newVal, oldVal) {
      if (newVal == true) {
        this.walletList = await storage.getWalletList(storage.getHighestWalletVersion())
      }
    },
    async walletList() {
      this.address = await storage.getAddress(storage.getHighestWalletVersion())
    }
  },
  async mounted() {
    this.address = await storage.getAddress(storage.getHighestWalletVersion())
    this.walletList = await storage.getWalletList(storage.getHighestWalletVersion())
  },
  methods: {
    handleClick() {
      console.log(1)
      this.showTools = !this.showTools
    },
    async switchAccount(walletItem) {
      await storage.switchWallet(walletItem.p1, JSON.parse(JSON.stringify(walletItem.p2)), walletItem.walletName, storage.getHighestWalletVersion())
      this.address = await storage.getAddress(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', this.address)
      this.$store.dispatch('refresh')
      this.showTools = false

      // 跳转到总览
      if (window.location.href.indexOf('connectWallet') == -1) {
        await this.$router.push('overview')
      }
    },
    publicKeyToAddress(publicKey) {
      if (publicKey !== undefined) return ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))
      return undefined
    },
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
    importKey() {
      this.showTools = false
      this.openImportKeyModal()
    }
  },
  props: {
    openForgetWalletModal: Function,
    openExportKeyModal: Function,
    openCreateModal: Function,
    openImportKeyModal: Function

  }
}
</script>

<style scoped>
.header-tools {
  @apply mt-auto px-15 flex-shrink-0;
  z-index: 1;
}

.green {
  color: green;
}

.header-tools__expand {
  /*@apply hidden md:flex items-center text-gray transition-colors hover:text-white;*/
  @apply flex items-center text-gray transition-colors hover:text-white;
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

.header-tools__icon--users {
  @apply w-20;
}

/*@screen md {*/
.header-tools {
  /*@apply flex-col space-y-10 absolute top-40 w-56 right-0 bg-black p-0 rounded flex-wrap mt-0;*/
  @apply flex-col space-y-10 absolute w-56 bg-black p-0 rounded flex-wrap mt-2 right-0 top-40;
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

.header-tools__expand {
  padding: 0.75rem 1.6875rem;
}

@screen md {
  .header-tools__expand {
    padding: 0;
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
