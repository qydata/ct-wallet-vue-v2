<template>
  <div>
    <ForgetWallet :close="closeForgetWalletModal" :afterForget="afterForgetWallet" :visible="true"
                  v-if="showForgetWalletModal"/>
    <ExportKey :close="closeExportKeyModal" :visible="true" v-if="showExportKeyModal"/>
    <CreateModal :afterCreate="gotoAuthBind" :close="closeCreateModal" :visible="true"
                 v-if="createAndImportModal === 'create'"/>
    <ImportKey :afterRestore="gotoAuthBind" :close="closeCreateModal" :visible="true"
               v-if="createAndImportModal === 'import'"/>
    <AuthBindModal :afterAuthBind="gotoCharge" :close="closeCreateModal"
                   :visible="true" v-if="createAndImportModal === 'authBind'"/>
    <SessionsModal :afterAuthBind="closeCreateModal" :close="closeCreateModal"
                   :visible="true" v-if="createAndImportModal === 'sessions'"/>
    <ChargeModal :afterCharge="gotoOverview" :visible="true" v-if="createAndImportModal === 'charge'"
                 :label="'header'"/>
    <PayCardModal
      :afterCharge="closeCreateModal"
      :showAddPay="showAddPay"
      :visible="true" v-if="createAndImportModal === 'card'"/>
    <AddPayCardModal :afterCharge="openCardModal" :visible="true" v-if="createAndImportModal === 'addcard'"/>

    <v-app-bar :elevation="2" :collapse="false">

      <template v-slot:prepend>
        <v-avatar
          rounded="0">
          <v-img src="/assets/logo.svg" alt="CT Wallet"/>
        </v-avatar>

      </template>
      <template v-slot:title>
        <div class="hidden md:block">
          <v-tabs
            v-model="tab"
            align-tabs="start"
          >
            <v-tab :to="item.link" v-for="(item, index) in mainNav"
                   v-bind:key="index"
                   :value="item.link">
              {{ item.text }}
            </v-tab>

          </v-tabs>
        </div>
      </template>
      <template v-slot:append>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn :prepend-icon="UsersIcon" :append-icon="ChevronDownIcon" v-bind="props">{{ walletName }}</v-btn>
          </template>
          <v-list lines="one">
            <v-list-item
              :title="item.walletName"
              @click="switchAccount(item)"
              v-for="(item, index) in walletList" :key="index"
              :subtitle="publicKeyToAddress(item.p1)"
            >
              <template v-slot:prepend>
                <v-btn
                  :icon="KeyIcon"
                  :color="address.toLowerCase() == publicKeyToAddress(item.p1).toLowerCase() && 'primary'"
                  variant="text"
                >
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>


        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn :icon="DotsVerticalIcon" variant="text" v-bind="props"></v-btn>
          </template>

          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="openExportKeyModal"
                  :prepend-icon="SortDescendingIcon"
                  variant="text"
                >导出私钥
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="openAuthBindModal"
                  :prepend-icon="UserIcon"
                  variant="text"
                >实名
                </v-btn>
              </template>
            </v-list-item>

<!--            <v-list-item>-->
<!--              <template v-slot:prepend>-->
<!--                <v-btn-->
<!--                  @click="openSessionModal"-->
<!--                  :prepend-icon="SparklesIcon"-->
<!--                  variant="text"-->
<!--                >dApp 会话-->
<!--                </v-btn>-->
<!--              </template>-->
<!--            </v-list-item>-->

            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="openCreateModal"
                  :prepend-icon="PlusIcon"
                  variant="text"
                >新建账户
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="openImportKeyModal"
                  :prepend-icon="SortAscendingIcon"
                  variant="text"
                >导入账户
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="openCardModal"
                  :prepend-icon="CreditCardIcon"
                  variant="text"
                >我的支付
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="lock"
                  :prepend-icon="LockOpenIcon"
                  variant="text"
                >锁定钱包
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-btn
                  @click="open('https://github.com/qydata/ct-wallet-vue-v2')"
                  :prepend-icon="LockOpenIcon"
                  variant="text"
                >开源链接
                </v-btn>
              </template>
            </v-list-item>

          </v-list>
        </v-menu>
      </template>
    </v-app-bar>
  </div>
</template>

<script>
import {mapState} from 'vuex'
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
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {
  DotsVerticalIcon, ChevronDownIcon, SortDescendingIcon, UsersIcon, UserIcon,
  SparklesIcon,
  PlusIcon,
  SortAscendingIcon,
  CreditCardIcon,
  LockOpenIcon,
  KeyIcon
} from '@heroicons/vue/outline'
import {getWalletName} from '../utils/storage'

const ethUtil = require('ethereumjs-util')

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Header',
  data: function () {
    return {
      tab: '/overview',
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
        // {
        //   link: '/display',
        //   text: '通证'
        // },

        // {
        //   link: '/publicity',
        //   text: '公示'
        // },

        {
          text: '资讯',
          link: '/news'
        },
        {
          text: '发现',
          link: '/discover'
        },
        {
          link: '/dapp',
          text: 'Dapp'
        }

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
        // {
        //   link: 'https://github.com/qydata/ct-wallet-vue-v2',
        //   external: 'https://github.com/qydata/ct-wallet-vue-v2',
        //   text: '开源链接'
        // }
      ],
      walletList: [],
      walletName: '',
    }
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
  computed: {
    ...mapState(['address'])
  },
  async mounted() {
    this.walletName = await getWalletName()
    this.walletList = await storage.getWalletList(storage.getHighestWalletVersion())
    const intent = this.$route.query.intent
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
      const needAuth = sessionStorage.getItem('needAuth')
      if (needAuth != null) {
        sessionStorage.removeItem('needAuth')
        await this.gotoAuthBind()
      }
    }
  },
  methods: {
    openLink(_item) {
      this.tab = '/dapp'
      window.open(_item.link)
    },
    async switchAccount(walletItem) {
      await storage.switchWallet(walletItem.p1, JSON.parse(JSON.stringify(walletItem.p2)), walletItem.walletName, storage.getHighestWalletVersion())
      this.$store.commit('setAddress', this.address)
      this.$store.dispatch('refresh')
      this.showTools = false

      // 跳转到总览
      location.reload()
      // await this.$router.push('overview')
      // this.$router.replace({ path: '/overview', query: { t: Date.now() } });
      // this.$forceUpdate()
    },
    publicKeyToAddress(publicKey) {
      if (publicKey !== undefined) return ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))
      return undefined
    },
    lock() {
      this.$store.commit('lock')
      this.$router.push('/')
    },
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
    async openAuthBindModal() {
      this.showNav = false
      // 判断是否实名
      queryCert({address: this.address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          this.createAndImportModal = 'authBind'
        }
        else {
          this.$message.error('当前账户已经实名!')
        }
      }).catch((e) => {
        console.log(e)
      })
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
      const address = await storage.getAddress(storage.getHighestWalletVersion())
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
      const address = await storage.getAddress(storage.getHighestWalletVersion())
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
      const callbackURL = sessionStorage.getItem('callbackURL')
      const callBack = sessionStorage.getItem('callBack')
      const sessionId = sessionStorage.getItem('sessionId')
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
  },
  setup() {
    return {
      DotsVerticalIcon,
      ChevronDownIcon, UsersIcon, UserIcon,
      SparklesIcon, SortDescendingIcon,
      PlusIcon,
      SortAscendingIcon,
      CreditCardIcon,
      LockOpenIcon, KeyIcon
    }
  }
}
</script>
<style scoped>
</style>
