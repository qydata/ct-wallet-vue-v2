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
  SparklesIcon,
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
    SparklesIcon,
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
    session() {
      this.showTools = false
      this.openSessionModal()
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
    openSessionModal: Function,
    openImportKeyModal: Function,
    openCardModal: Function
  }
}
</script>

<style scoped>
</style>
