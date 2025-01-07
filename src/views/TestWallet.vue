<template>
  <div>
    <Header/>
    <!--    <AccountPanel view="dapp"/>-->
    <div class="bg-gray-200 dapp-div1">
      <v-btn @click="handleRequestAccount(1)">
        Request Account
      </v-btn>
      <v-btn @click="handleSendTransaction({
      from: address,
      to: '0x6331384FD95eedC4C5cE96d4bdFe14D7fC365554',
      value:'0',
      data:'0x01',
      gasPrice:'4800000000000',
       chainId: 27 // 指定 chainId
      })">
        Request Send Transaction
      </v-btn>

      <v-btn
        @click="handlePersonalSign('0x584d5450203a20456e61626c65206c64656e746974790a663238653664376535626562636533633230393338366164316164303132323361656131356331343935366164333033393837393831326462373630356664610a0a466f72206d6f726520696e666f3a0a68747470733a2f2f6374626c6f636b2e636e2f7369676e6174757265732f')">
        Request Personal Sign
      </v-btn>
      <v-btn @click="handleNotSupported('method_not_supported')">
        Request Not Supported
      </v-btn>
    </div>
    <Sessions/>
    <DappQuickHistory/>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Sessions from '../components/modal/Sessions.vue'
import DappQuickHistory from '../components/web3Connect/DappQuickHistory.vue'
import {EIP155Method} from '../services/config/EIP155'
import WalletConnect from '../store/walletConnect'
import {mapState} from 'vuex'
import ViewDapp from './Dapp.vue'

export default {
  name: 'ViewTestWallet',
  data: function () {
    return {
      // 替换为你要嵌入的页面地址
      direction: 'btt'
    }
  },
  components: {
    ViewDapp,
    DappQuickHistory,
    Header,
    Sessions
  },
  computed: {
    ...mapState(['address']),
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    hideReleasedStakes() {
      return this.$route.query.hideReleased === '1' || false
    }
  },
  methods: {
    handleRequestAccount(params) {
      WalletConnect.emit(EIP155Method.RequestAccount, {params})
    },
    handlePersonalSign(params) {
      //  not impl
    },
    handleSendTransaction(params) {
      //  not impl
    },

    handleNotSupported(method) {
      //  not impl
    }
  },
  watch: {}
}
</script>

<style scoped>
</style>

