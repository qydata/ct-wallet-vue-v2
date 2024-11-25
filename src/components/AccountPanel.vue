<template>
  <div class="account-panel">

    <div class="container">
      <div class="account-panel__left">
        <div class="flex gap-6 mt-5">
          <span class="text-4xl">
            地址详情
          </span>
          <el-tag class="self-center" effect="light" type="info">
            {{ walletName }}
          </el-tag>
          <el-icon :size="20" class="self-center cursor-pointer" @click="dialogVisible = true"
                   color="rgba(14, 204, 95)"
          >
            <EditPen/>
          </el-icon>
        </div>
        <div class="mt-5 flex gap-6 mt-20">
          <el-image
            class=" rounded-full bg-yellow-500 w-20 h-20 align-middle"
            src="/assets/address-icon.svg"/>
          <span class="text-md overflow-hidden overflow-ellipsis" style="max-width: 75vw">{{ address }}      </span>
          <button
            class=" col-span-1 align-middle flex-shrink-0 w-20 text-green on-clicked-effect" v-if="canCopy"
            @click="copyToClipboard(address)">
            <ClipboardCopyIcon/>
          </button>
        </div>

        <div class="account-panel__balance mt-30 grid grid-cols-9 gap-8">

          <div class="text-md col-span-2 py-4">
            <el-tooltip class="box-item" effect="dark" content="账户余额"
                        placement="right-end">

              <el-icon class="el-icon--right mb-1 align-middle">
                <InfoFilled/>
              </el-icon>
            </el-tooltip>
            余额
          </div>
          <h1 class="text-md col-span-7 py-4">
            <Amount :value="xctBalance" :decimalPlaces="2" currency="rmb" sub/>
          </h1>

          <div class="text-md col-span-2 py-4">
            <el-tooltip class="box-item" effect="dark" content="草田分余额"
                        placement="right-end">

              <el-icon class="el-icon--right mb-1 align-middle">
                <InfoFilled/>
              </el-icon>
            </el-tooltip>
            手续费
          </div>
          <h1 class="text-md col-span-7  py-4">
            <Amount :value="balance" :decimalPlaces="6" currency="草田分" sub/>
          </h1>

          <div class="text-md col-span-2 py-4">
            <el-tooltip class="box-item" effect="dark" content="账户中的所有通证"
                        placement="right-end">

              <el-icon class="el-icon--right mb-1 align-middle">
                <InfoFilled/>
              </el-icon>
            </el-tooltip>
            通证
          </div>

          <el-dropdown trigger="click" class="col-span-7" :disabled="tokenBalances.length==0">
            <span class="el-dropdown-link border-2 border-gray-600 rounded-lg pb-5 pt-6 px-5 flex gap-2">
              <el-icon class="el-icon--right mr-10">
                <Menu/>
              </el-icon>
              {{ tokenBalances.length }}
              <el-icon class="el-icon--right"><arrow-down/>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu style="height: 50vh">
                <el-dropdown-item v-for="(item, index) in tokenBalances" :key="index">
                  <div @click="dropDown(item)">
                    <div class="grid grid-cols-3" style="width: 300px">
                      <div class="font-bold text-white col-span-3">
                        {{ item.token.name }}
                      </div>
                      <span class="col-span-2 overflow-hidden overflow-ellipsis">
                          {{ item.token.type }}
                          <span v-if="item.token_id != null">
                            #{{ item.token_id.slice(0, 20) }}...
                          </span>
                        </span>
                      <span class="col-span-1 text-right overflow-hidden overflow-ellipsis">
                          {{
                          item.token.decimals == null ? item.value :
                            formatUnits(item.value, item.token.decimals)
                        }}
                        </span>
                    </div>
                    <el-divider style="margin: 8px 0px 0px 0"></el-divider>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="">
        <div class="account-panel__buttons">
          <button class="w-full button button--success" @click="openSend">
            <span class="w-12 button__icon">
              <ArrowUpIcon/>
            </span>
            发送
          </button>

          <button class="w-full button button--outline-success" @click="openReceive">
            <span class="w-12 button__icon">
              <ArrowDownIcon/>
            </span>
            接收
          </button>

          <!--          <button class="w-full button button&#45;&#45;outline-success" @click="openCharge">-->
          <!--            <span class="button__icon w-15">-->
          <!--              <SwitchHorizontalIcon/>-->
          <!--            </span>-->
          <!--            充值-->
          <!--          </button>-->

          <button class="w-full button button--outline-success" @click="openExchange">
            <span class="button__icon w-15">
              <Connection/>
            </span>
            交易
          </button>
        </div>
      </div>
    </div>

    <div class="account-panel__modals">
      <CreateStakeModal :close="reset" v-if="modal === 'createStake'" :visible="true"/>
      <DepositModal :close="openExchange" v-if="modal === 'deposit'" :visible="true"/>
      <WithdrawModal :close="openExchange" v-if="modal === 'withdraw'" :visible="true"/>
      <SellModal :close="openExchange" v-if="modal == 'sell'" :visible="true"/>
      <BuyModal :close="openExchange" v-if="modal === 'buy'" :visible="true"/>
      <ReceiveModal :close="reset" v-if="modal === 'receive'" :visible="true"/>
      <AuthBindModal :afterAuthBind="reset" :close="reset" v-if="modal == 'authBind'" :visible="true"/>
      <SendModal :close="reset" :item="item" v-if="modal === 'send'" :visible="true"/>
      <SwapModal
        :close="reset"
        :openDeposit="openDeposit"
        :openWithdraw="openWithdraw"
        :openSell="openSell"
        v-if="modal === 'swap'" :visible="true"
      />
      <ExchangeModal
        :close="reset"
        :openDeposit="openDeposit"
        :openWithdraw="openWithdraw"
        :openBuy="openBuy"
        :openCharge="openCharge"
        :openSell="openSell"
        v-if="modal === 'exchange'" :visible="true"
      />
      <ChargeModal :close="openExchange" :afterCharge="openPay" v-if="modal === 'charge'" :visible="true"
                   :label="'accountPanel'"/>
      <PayModal :close="closePay" :order="order" v-if="modal === 'pay'" :visible="true"/>

      <el-dialog
        v-model="dialogVisible"
        title=""
        :show-close="false"
        width="500"
      >
        <el-input
          size="large" type="text" autocomplete="off" placeholder="输入一个钱包名称"
          v-model="walletName"
          class="pl-1"/>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">关闭</el-button>
            <el-button type="success" @click="createOnEnter">
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import AuthBindModal from '@/components/index/AuthBindModal'
import {fetchTokenBalance, queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {ArrowDown, Connection, EditPen, InfoFilled, Menu} from '@element-plus/icons-vue'

import {ArrowDownIcon, ArrowUpIcon, ClipboardCopyIcon, PlusIcon, SwitchHorizontalIcon} from '@heroicons/vue/outline'
import {mapState} from 'vuex'
import {getWalletName, setWalletName} from '../utils/storage'
import Amount from './Amount.vue'
import ChargeModal from './index/ChargeModal'
import PayModal from './index/PayModal'
import CreateStakeModal from './stakes/CreateStakeModal'
import BuyModal from './tx/BuyModal'
import DepositModal from './tx/DepositModal'
import ExchangeModal from './tx/ExchangeModal'
import ReceiveModal from './tx/ReceiveModal'
import SellModal from './tx/SellModal'
import SendModal from './tx/SendModal'
import SwapModal from './tx/SwapModal'
import WithdrawModal from './tx/WithdrawModal'

// eslint-disable-next-line no-undef
const ethers = require('ethers')

export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    Amount,
    ArrowDownIcon,
    ArrowUpIcon,
    CreateStakeModal,
    DepositModal,
    ReceiveModal,
    SellModal,
    BuyModal,
    SendModal,
    SwapModal,
    ExchangeModal,
    EditPen,
    ChargeModal,
    PayModal,
    // eslint-disable-next-line vue/no-unused-components
    SwitchHorizontalIcon,
    Connection,
    AuthBindModal,
    WithdrawModal,
    ClipboardCopyIcon,
    ArrowDown,
    Menu,
    InfoFilled
  },
  computed: mapState(['address', 'balance', 'xctBalance', 'cnyBalance']),
  data() {
    return {
      modal: '',
      walletName: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {},
      value: '',
      cities: [
        {
          value: 'Beijing',
          label: 'Beijing'
        },
        {
          value: 'Shanghai',
          label: 'Shanghai'
        },
        {
          value: 'Nanjing',
          label: 'Nanjing'
        },
        {
          value: 'Chengdu',
          label: 'Chengdu'
        },
        {
          value: 'Shenzhen',
          label: 'Shenzhen'
        },
        {
          value: 'Guangzhou',
          label: 'Guangzhou'
        }],
      tokenBalances: [],
      dialogVisible: false
    }
  },
  watch: {
    async address() {
      this.walletName = await getWalletName()
      this.getTokenBalance()
    },
    balance(newVal, oldVal) {
      // console.log('balance newVal', newVal)
      this.item.balance = newVal
    }
  },
  async mounted() {
    this.walletName = await getWalletName()
    this.isInIframe()
    this.getTokenBalance()
  },
  methods: {
    formatUnits(value, decimals) {
      return ethers.utils.formatUnits(value, decimals)
    },
    dropDown(items) {
      switch (items.token.type) {
      case 'ERC-1155':
      case 'ERC-721':
        window.open(`https://ctblock.cn/token/${items.token.address}/instance/${items.token_id}`)
        break
      default:
        console.log(items)
        break
      }

    },
    getTokenBalance() {
      fetchTokenBalance(this.address).then(r => {
        if (r.data instanceof Array) {
          this.tokenBalances = r.data
        }
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

    closeCharge() {
      this.modal = ''
    },
    openPay(order) {
      console.log(order)
      this.order = order
      this.modal = 'pay'
    },
    closePay() {
      this.modal = ''
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    async createOnEnter() {
      // 修改钱包名称
      await setWalletName(this.walletName, this.address, storage.getHighestWalletVersion())
      this.dialogVisible = false
    },

    openCreateStake() {
      this.modal = 'createStake'
    },
    openDeposit() {
      this.modal = 'deposit'
    },
    async authJudge(oriName) {

      // 查询实名状态
      const address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          const r = confirm('当前账户未进行实名认证, 认证过后才可以进行手续费接收和充值, 点击确认去认证!')
          if (r == true) {
            console.log('You pressed OK!')
            this.modal = 'authBind'
          }
        }
        else {
          this.modal = oriName
        }
      }).catch((e) => {
        console.log(e)
      })

    },
    async openReceive() {
      await this.authJudge('receive')
    },
    openSell() {
      this.modal = 'sell'
    },
    openBuy() {
      this.modal = 'buy'
    },
    openSend() {
      this.modal = 'send'
    },
    openSwap() {
      this.modal = 'swap'
    },
    openExchange() {
      this.modal = 'exchange'
    },
    async openCharge() {
      // 查询实名状态
      await this.authJudge('charge')
    },
    openWithdraw() {
      this.modal = 'withdraw'
    },
    reset() {
      this.modal = ''
    }
  }
}

</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__left {
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

.account-panel__left div {
  @apply text-white;
}

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
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

  .account-panel__left {
    @apply w-auto;
  }

  .account-panel__address span {
    @apply inline;
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
@screen lg {
  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

}
</style>
