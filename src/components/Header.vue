<template>
  <div>
    <ForgetWallet :close="closeForgetWalletModal" :afterForget="afterForgetWallet" :visible="showForgetWalletModal"/>
    <ExportKey :close="closeExportKeyModal" :visible="showExportKeyModal"/>
    <CreateModal :afterCreate="gotoAuthBind" :close="closeCreateModal" :visible="createAndImportModal === 'create'"/>
    <ImportKey :afterRestore="gotoAuthBind" :close="closeCreateModal" :visible="createAndImportModal === 'import'"/>
    <AuthBindModal :afterAuthBind="gotoCharge" :close="closeCreateModal"
                   :visible="createAndImportModal === 'authBind'"/>
    <SessionsModal :afterAuthBind="closeCreateModal" :close="closeCreateModal"
                   :visible="createAndImportModal === 'sessions'"/>
    <ChargeModal :afterCharge="gotoOverview" :visible="createAndImportModal === 'charge'" :label="'header'"/>
    <PayCardModal
      :afterCharge="closeCreateModal"
      :showAddPay="showAddPay"
      :visible="createAndImportModal === 'card'"/>
    <AddPayCardModal :afterCharge="openCardModal" :visible="createAndImportModal === 'addcard'"/>
    <header class="relative z-10 py-10 header md:pb-10" :class="{'menu-open':showNav}">
      <div class="container flex items-center justify-between">
        <Logo/>
        <BurgerButton @click="showNav = !showNav"/>
        <!-- eslint-disable-next-line max-len -->
        <div
          class="absolute left-0 right-0 flex flex-col flex-1 pt-12 pb-24 bg-black mobile-drop top-full md:static md:flex-row md:pl-15 md:p-0">
          <Menu :mainNav="mainNav"/>

          <WalletList/>
          <div style="width: 40px"></div>
          <HeaderTools :openForgetWalletModal="openForgetWalletModal"
                       :openExportKeyModal="openExportKeyModal"
                       :openAuthBindModal="openAuthBindModal"
                       :openCreateModal="openCreateModal"
                       :openSessionModal="openSessionModal"
                       :openImportKeyModal="openImportKeyModal"
                       :openCardModal="openCardModal"

          />

        </div>
      </div>
    </header>
  </div>
</template>

<script>
import BurgerButton from '@/components/BurgerButton'
import HeaderTools from '@/components/HeaderTools'
import AddPayCardModal from '@/components/index/AddPayCardModal'
import AuthBindModal from '@/components/index/AuthBindModal'
import SessionsModal from '@/components/index/SessionsModal'
import ChargeModal from '@/components/index/ChargeModal'
import CreateModal from '@/components/index/CreateModal'
import ExportKey from '@/components/index/ExportModal'
import ForgetWallet from '@/components/index/ForgetModal'
import ImportKey from '@/components/index/ImportModal'
import PayCardModal from '@/components/index/PayCardModal'
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
        // {
        //   link: '/transactions',
        //   text: '交易'
        // },
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
          text: '通证'
        },

        {
          link: '/publicity',
          text: '公示'
        },
        {
          link: '/dapp',
          text: 'Dapp'
        },

        // {
        //   link: process.env.VUE_APP_GOVERNANCE_URL,
        //   text: 'Governance',
        //   external: true
        // },
        // {
        //   link: '/chatPanel',
        //   text: '区块链邮件'
        // },
        // {
        //   link: '/mintPanel',
        //   text: 'NFT'
        // },
        {
          link: 'https://github.com/qydata/ct-wallet-vue-v2',
          external: 'https://github.com/qydata/ct-wallet-vue-v2',
          text: '开源链接'
        }
      ]
    }
  },
  async mounted() {

    let intent = this.$route.query.intent
    if (intent !== null && intent !== undefined && intent.length > 1) {
      console.log('intent', intent)
      this.createAndImportModal = intent
      setTimeout(() => {
        const url = window.location
        const newUrl = url.origin + url.pathname
        // 不刷新页面
        history.pushState('', '', newUrl)
        // url.href = newUrl; // 刷新页面
      }, 4000)
    }
    else {
      let needAuth = sessionStorage.getItem('needAuth')
      if (needAuth != null) {
        sessionStorage.removeItem('needAuth')
        await this.gotoAuthBind()
      }
    }
  },
  methods: {
    closeForgetWalletModal() {
      this.showForgetWalletModal = false
    },
    openForgetWalletModal() {
      this.showNav = false
      this.showForgetWalletModal = true
    },
    afterForgetWallet() {
      this.$router.push('/')
    },
    closeExportKeyModal() {
      this.showExportKeyModal = false
    },
    openExportKeyModal() {
      this.showNav = false
      this.showExportKeyModal = true
    },
    closeCreateModal() {
      this.createAndImportModal = ''
    },
    openCreateModal() {
      this.showNav = false
      this.createAndImportModal = 'create'
    },
    openAuthBindModal() {
      this.showNav = false
      this.createAndImportModal = 'authBind'
    },
    openSessionModal() {
      this.showNav = false
      this.createAndImportModal = 'sessions'
    },
    openImportKeyModal() {
      this.showNav = false
      this.createAndImportModal = 'import'
    },
    openCardModal() {
      this.showNav = false
      this.createAndImportModal = 'card'
    },
    showAddPay() {
      this.showNav = false
      this.createAndImportModal = 'addcard'
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
    isInIframe() {
      if (window.self !== window.top) {
        console.log('这个网页是在 iframe 中加载的。')
        return true
      }
      else {
        console.log('这个网页不是在 iframe 中加载的。')
        return false
      }
    },
    async authJudge(oriName) {

      // 查询实名状态
      let address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          // 未实名
          this.createAndImportModal = ''
        }
        else if (this.isInIframe() === false) {
          this.createAndImportModal = oriName
        }
        else {
          this.createAndImportModal = ''
        }
      }).catch((e) => {
        console.log(e)
      })
    },
    async gotoCharge() {
      this.authJudge('charge')
    },
    async gotoOverview() {
      let callbackURL = sessionStorage.getItem('callbackURL')
      let callBack = sessionStorage.getItem('callBack')
      let sessionId = sessionStorage.getItem('sessionId')
      if (callbackURL != null) {
        sessionStorage.removeItem('callbackURL')
        sessionStorage.removeItem('callBack')
        sessionStorage.removeItem('sessionId')
        this.$router.push({
          path: '/connectWallet',
          query: {
            sessionId: sessionId,
            callBack: callBack
          }
        })
      }
      else {
        this.createAndImportModal = ''
        this.$router.push('overview')
      }
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
    SessionsModal,
    ChargeModal,
    PayCardModal,
    AddPayCardModal
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
