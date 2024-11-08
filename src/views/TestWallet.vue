<template>
  <div>
    <Header/>
    <!--    <AccountPanel view="dapp"/>-->
    <div class="bg-gray-200 dapp-div1">
      <el-button @click="handleRequestAccount(1)">
        Request Account
      </el-button>
      <el-button @click="handleSendTransaction({
      from: address,
      to: '0x6331384FD95eedC4C5cE96d4bdFe14D7fC365554',
      value:'0',
      data:'0x01',
      gasPrice:'4800000000000',
       chainId: 27 // 指定 chainId
      })">
        Request Send Transaction
      </el-button>

      <el-button
        @click="handlePersonalSign('0x584d5450203a20456e61626c65206c64656e746974790a663238653664376535626562636533633230393338366164316164303132323361656131356331343935366164333033393837393831326462373630356664610a0a466f72206d6f726520696e666f3a0a68747470733a2f2f6374626c6f636b2e636e2f7369676e6174757265732f')">
        Request Personal Sign
      </el-button>
      <el-button @click="handleNotSupported('method_not_supported')">
        Request Not Supported
      </el-button>
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
.checkbox-container {
  @apply flex items-center mb-10 justify-end;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-container label {
  @apply cursor-pointer mr-5 mb-0;
}

.checkbox-container input {
  opacity: 0;
  height: 0;
  width: 0;
}

/* Create custom checkbox */
.checkmark {
  @apply cursor-pointer mr-5 mb-0;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 1px #787878;
  border-radius: 3px;
}

/* On mouse-over, add grey background color */
.checkbox-container:hover input ~ .checkmark {
  border-color: rgb(70, 70, 70);
}

/* When checkbox is checked, add green background */
.checkbox-container input:checked ~ .checkmark {
  background-color: rgb(14, 204, 95);
  border: none;
}

/* Create checkmark (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show checkmark when checked */
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style for checkmark */
.checkbox-container .checkmark:after {
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

/* 确保 iframe 父元素及根容器无多余边距 */
.full-screen-iframe {
  margin: 0;
  padding: 0;
  height: 90vh;
  width: 100vw;
}

.dapp-div1 {
  padding-top: 1vh;
}
</style>

