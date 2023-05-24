<template>
  <div class="account-panel">

    <div class="container">
      <div class="account-panel__left">
        <div class="account-panel__address">
          <h3 class="mb-1">钱包名称</h3>
          <div style="display: flex">
            <input
              type="text"
              @keypress="createOnEnter"
              autocomplete="off"
              placeholder="输入一个钱包名称"
              id="walletName"
              v-model="walletName"
            />
            <el-tooltip
              class="box-item"
              effect="dark"
              content="点击钱包名修改钱包名称,回车确认修改"
              placement="right-end"
            >
              <el-icon
                :size="24"
                color="rgba(14, 204, 95, var(--tw-text-opacity))"
                style="vertical-align: middle;height: 57px;margin-left: 10px;cursor: pointer">
                <InfoFilled/>
              </el-icon>
            </el-tooltip>

          </div>

        </div>

        <div class="account-panel__address">
          <h3 class="mb-1">地址</h3>
          <span>{{ address }}</span>
          <button
            class="flex-shrink-0 w-24 ml-24 text-green on-clicked-effect"
            v-if="canCopy"
            @click="copyToClipboard(address)"
          >
            <ClipboardCopyIcon/>
          </button>
        </div>

        <div class="account-panel__balance">
          <h3 class="mb-1">余额</h3>
          <h1>
            <Amount :value="balance" :decimalPlaces="6" currency="CT" sub/>
          </h1>
          <h2 v-if="false">¥
            <Amount :value="usdBalance" currency=" CNY" :decimalPlaces="2"/>
          </h2>
        </div>
      </div>

      <div class="account-panel__right">
        <div v-if="view === 'staking'" class="account-panel__buttons staking-buttons">
          <button class="w-full button button--success" @click="openCreateStake">
            <span class="w-12 button__icon">
              <PlusIcon class="w-15"/>
            </span>
            Create Stake
          </button>
        </div>
        <div v-else class="account-panel__buttons">
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

          <button v-if="false" class="w-full button button--outline-success" @click="openSwap">
            <span class="button__icon w-15">
              <SwitchHorizontalIcon/>
            </span>
            Swap
          </button>
          <button class="w-full button button--outline-success" @click="openCharge">
            <span class="button__icon w-15">
              <SwitchHorizontalIcon/>
            </span>
            充值
          </button>
        </div>
      </div>
    </div>

    <div class="account-panel__modals">
<!--      <CreateStakeModal :close="reset" :visible="modal === 'createStake'"/>-->
<!--      <DepositModal :close="reset" :visible="modal === 'deposit'"/>-->
      <ReceiveModal :close="reset" :visible="modal === 'receive'"/>
      <SellModal :close="reset" :visible="modal === 'sell'"/>
      <AuthBindModal :afterAuthBind="reset" :close="reset" :visible="modal == 'authBind'"/>
      <SendModal :close="reset" :item="item" :visible="modal === 'send'"/>
<!--      <SwapModal-->
<!--        :close="reset"-->
<!--        :openDeposit="openDeposit"-->
<!--        :openWithdraw="openWithdraw"-->
<!--        :openSell="openSell"-->
<!--        :visible="modal === 'swap'"-->
<!--      />-->
      <ChargeModal
        :close="closeCharge"
        :afterCharge="openPay"
        :visible="modal === 'charge'"
      />
      <PayModal
        :close="closePay"
        :order="order"
        :visible="modal === 'pay'"
      />
      <WithdrawModal :close="reset" :visible="modal === 'withdraw'"/>
    </div>
  </div>
</template>

<script>
import AuthBindModal from '@/components/index/AuthBindModal'
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {InfoFilled} from '@element-plus/icons-vue'
import {ArrowDownIcon, ArrowUpIcon, ClipboardCopyIcon, PlusIcon, SwitchHorizontalIcon} from '@heroicons/vue/outline'
import {mapState} from 'vuex'
import Amount from './Amount.vue'
import ChargeModal from './index/ChargeModal'
import PayModal from './index/PayModal'
import CreateStakeModal from './stakes/CreateStakeModal'
import DepositModal from './tx/DepositModal'
import ReceiveModal from './tx/ReceiveModal'
import SellModal from './tx/SellModal'
import SendModal from './tx/SendModal'
import SwapModal from './tx/SwapModal'
import WithdrawModal from './tx/WithdrawModal'

export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    Amount,
    ArrowDownIcon,
    ArrowUpIcon,
    CreateStakeModal,
    DepositModal,
    PlusIcon,
    ReceiveModal,
    SellModal,
    SendModal,
    SwapModal,
    InfoFilled,
    ChargeModal,
    PayModal,
    SwitchHorizontalIcon,
    AuthBindModal,
    WithdrawModal,
    ClipboardCopyIcon
  },
  computed: mapState(['address', 'balance', 'usdBalance']),
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
      order: {}
    }
  },
  watch: {
    async address() {
      this.walletName = await storage.getWalletName()
    },
    balance(oldVal, newVal) {
      // console.log('balance newVal', newVal)
      this.item.balance = newVal
    }
  },
  async mounted() {
    this.walletName = await storage.getWalletName()
  },
  methods: {

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
    async createOnEnter(event) {
      if (event.charCode !== 13) return
      // 修改钱包名称
      await storage.setWalletName(this.walletName, this.address, storage.getHighestWalletVersion())
    },

    openCreateStake() {
      this.modal = 'createStake'
    },
    openDeposit() {
      this.modal = 'deposit'
    },
    async authJudge(oriName) {

      // 查询实名状态
      let address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address}).then((res) => {
        if (res.code !== 200) {
          console.log(res.msg)
        }
        else if (!res.is_cert) {
          let r = confirm('当前账户未进行实名认证, 认证过后才可以进行手续费接收和充值, 点击确认去认证!')
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
    openSend() {
      this.modal = 'send'
    },
    openSwap() {
      this.modal = 'swap'
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

.account-panel__left,
.account-panel__right {
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

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

#walletName {
  padding-left: 0;
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

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

  .account-panel__buttons.staking-buttons {
    @apply grid-cols-1;
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
</style>
