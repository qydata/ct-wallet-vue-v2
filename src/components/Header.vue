<template>
  <div>
    <ForgetWallet :close="closeForgetWalletModal" :afterForget="afterForgetWallet" :visible="showForgetWalletModal"/>
    <ExportKey :close="closeExportKeyModal" :visible="showExportKeyModal"/>
    <CreateModal :afterCreate="gotoAuthBind" :close="closeCreateModal" :visible="createAndImportModal == 'create'"/>
    <ImportKey :afterRestore="gotoAuthBind" :close="closeCreateModal" :visible="createAndImportModal == 'import'"/>
    <AuthBindModal :afterAuthBind="gotoCharge"  :close="closeCreateModal" :visible="createAndImportModal == 'authBind'"/>
    <ChargeModal :afterCharge="gotoOverview" :visible="createAndImportModal == 'charge'"/>
    <header class="relative z-10 py-16 header md:pb-15" :class="{'menu-open':showNav}">
      <div class="container flex items-center justify-between">
        <Logo/>
        <BurgerButton @click="showNav = !showNav"/>
        <!-- eslint-disable-next-line max-len -->
        <div
          class="absolute left-0 right-0 flex flex-col flex-1 pt-12 pb-24 bg-black mobile-drop top-full md:static md:flex-row md:pl-15 md:p-0">
          <Menu :mainNav="mainNav"/>

          <WalletList/>
          <div style="width: 40px"></div>
          <HeaderTools :openForgetWalletModal="openForgetWalletModal" :openExportKeyModal="openExportKeyModal"
                       :openAuthBindModal="openAuthBindModal" :openCreateModal="openCreateModal"
                       :openImportKeyModal="openImportKeyModal"/>
        </div>
      </div>
    </header>
  </div>
</template>

<script>
/* global process */

import BurgerButton from '@/components/BurgerButton'
import HeaderTools from '@/components/HeaderTools'
import AuthBindModal from '@/components/index/AuthBindModal'
import ChargeModal from '@/components/index/ChargeModal'
import CreateModal from '@/components/index/CreateModal'
import ExportKey from '@/components/index/ExportModal'
import ForgetWallet from '@/components/index/ForgetModal'
import ImportKey from '@/components/index/ImportModal'
import Logo from '@/components/Logo'
import Menu from '@/components/Menu'
import WalletList from '@/components/WalletList'
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Header',
  data: function () {
    return {
      showForgetWalletModal: false,
      showExportKeyModal: false,
      showCreateModal: false,
      showImportKeyModal: false,
      createAndImportModal: '',
      showNav: false,
      mainNav: [
        {
          link: '/overview',
          text: '总览'
        },
        {
          link: '/transactions',
          text: '交易'
        },
        // {
        //   link: '/staking',
        //   text: 'Staking'
        // },
        // {
        //   link: '/nodes',
        //   text: 'Nodes'
        // },
        {
          link: '/display',
          text: '展示'
        },

        // {
        //   link: process.env.VUE_APP_GOVERNANCE_URL,
        //   text: 'Governance',
        //   external: true
        // },
        {
          link: '/chatPanel',
          text: '去中心化Chat'
        },
        {
          link: '/mintPanel',
          text: 'NFT'
        }
      ]
    }
  },
  async mounted() {

  },
  methods: {
    closeForgetWalletModal() {
      this.showForgetWalletModal = false
    },
    openForgetWalletModal() {
      this.showForgetWalletModal = true
    },
    afterForgetWallet() {
      this.$router.push('/')
    },
    closeExportKeyModal() {
      this.showExportKeyModal = false
    },
    openExportKeyModal() {
      this.showExportKeyModal = true
    },
    closeCreateModal() {
      this.createAndImportModal = ''
    },
    openCreateModal() {
      this.createAndImportModal = 'create'
    },
    openAuthBindModal() {
      this.createAndImportModal = 'authBind'
    },
    closeImportKeyModal() {
      this.createAndImportModal = ''
    },
    openImportKeyModal() {
      this.createAndImportModal = 'import'
    },
    async gotoAuthBind() {

      // 判断是否实名
      let address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          this.createAndImportModal = 'authBind'
        }
        else {
          this.createAndImportModal = 'charge'
        }
      }).catch((e) => {
        console.log(e)
      })

    },
    async gotoCharge() {
      this.createAndImportModal = 'charge'
    },
    async gotoOverview() {
      this.createAndImportModal = ''
      this.$router.push('overview')
    }
  },
  components: {
    Logo,
    Menu,
    HeaderTools,
    WalletList,
    BurgerButton,
    ForgetWallet,
    ExportKey,
    ImportKey,
    CreateModal,
    AuthBindModal,
    ChargeModal
  }
}
</script>
<style scoped>
.header {
  @apply bg-black text-white;
}

.mobile-drop {
  height: calc((var(--vh) * 100) - 71px);
  transform: translateX(-100%);
  transition: 0.3s transform cubic-bezier(.01, .1, .11, 1), 0.3s opacity cubic-bezier(.01, .1, .11, 1), 0.3s visibility cubic-bezier(.01, .1, .11, 1);
  @apply overflow-hidden overflow-y-auto opacity-0 invisible;
}

@screen md {
  .mobile-drop {
    transform: translateX(0);
    @apply h-auto overflow-visible opacity-100 visible;
  }
}

.menu-open .mobile-drop {
  transform: translateX(0);
  @apply opacity-100 visible;
}
</style>
