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
</style>
