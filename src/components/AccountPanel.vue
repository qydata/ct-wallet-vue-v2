<template>
  <v-container class=" d-flex align-center justify-center">

    <v-card
      variant="elevated">
      <template v-slot:prepend>
        <v-avatar
          rounded="xl">
          <v-img
            class="bg-white"
            src="/assets/address-icon.svg"/>
        </v-avatar>

      </template>
      <template v-slot:title>
        地址详情
        <v-chip variant="elevated" @click="dialogVisible = true" rounded="xl" size="small" color="primary">
          {{ walletName }}
          <template v-slot:append>
            <v-icon size="small" :icon="EditPen"/>
          </template>
        </v-chip>
      </template>
      <template v-slot:subtitle>
        {{ address }}
      </template>
      <template v-slot:append>
        <v-btn
          :icon="ClipboardCopyIcon"
          variant="text"
          @click="copyToClipboard(address)">
        </v-btn>
      </template>

      <v-tabs
        v-model="tab"
        bg-color="transparent"
        color="primary"
        grow
      >
        <v-tab
          v-for="item in items"
          :key="item"
          :text="item"
          :value="item"
        >{{ item }}
        </v-tab>
      </v-tabs>
      <!-- v-tab-item 用于显示对应标签的内容 -->
      <v-tab-item v-if="tab === items[0]">
        <v-container>
          <v-row>
            <v-col>
              <v-list>
              </v-list>
            </v-col>
          </v-row>
          <v-row>

            <v-col cols="2" md="4"></v-col>
            <v-col>
              <v-card-item>
                <v-tooltip location="top" text="账户余额">
                  <template v-slot:activator="{ isActive,props }">
                    <v-icon size="x-small" :icon="InfoFilled" v-bind="props"></v-icon>
                  </template>
                </v-tooltip>
                <v-chip variant="text" rounded="xl" size="x-large">
                  余额:
                  <template v-slot:append>
                    <Amount :value="xctBalance" :decimalPlaces="2" currency="rmb" sub/>
                  </template>
                </v-chip>

              </v-card-item>
              <v-card-item>
                <v-tooltip location="top" text="草田分余额">
                  <template v-slot:activator="{ isActive,props }">
                    <v-icon size="x-small" :icon="InfoFilled" v-bind="props"></v-icon>
                  </template>
                </v-tooltip>
                <v-chip variant="text" rounded="xl" size="large">
                  手续费:
                  <template v-slot:append>
                    <Amount :value="balance" :decimalPlaces="6" currency="草田分" sub/>
                  </template>
                </v-chip>
              </v-card-item>
            </v-col>

          </v-row>
          <v-list-item></v-list-item>
          <v-card-actions>
            <v-row justify="center" align="center">

              <v-col cols="auto" align="center">
                <v-btn :icon="ArrowUpIcon" size="x-large" variant="elevated" @click="openSend"></v-btn>
                <div class="title">发送</div>
              </v-col>

              <v-col cols="auto" align="center">
                <v-btn :icon="ArrowDownIcon" size="x-large" variant="elevated" :loading="isReceiveLoading"
                       @click="openReceive"></v-btn>
                <div class="title">接收</div>
              </v-col>

              <v-col cols="auto" align="center">
                <v-btn :icon="Connection" size="x-large" variant="elevated" @click="openCharge"></v-btn>
                <div class="title">交易</div>
              </v-col>
            </v-row>
          </v-card-actions>
          <v-list-item></v-list-item>
          <v-divider/>
          <v-list-item></v-list-item>
          <v-list-item></v-list-item>
        </v-container>
      </v-tab-item>
      <v-tab-item v-if="tab === items[1]">
        <v-row>
          <v-col>
            <v-list>
            </v-list>
          </v-col>
        </v-row>
        <v-card-item>
          <v-tooltip location="right" text="账户中的所有通证">
            <template v-slot:activator="{ isActive,props }">
              <h2>
                <v-icon size="x-small" :icon="InfoFilled" v-bind="props"></v-icon>
                通证
              </h2>
            </template>

          </v-tooltip>

          <v-divider/>
        </v-card-item>
        <v-container class="scrollable-container">
          <v-row class="">
            <v-col cols="12" md="4" v-for="(token,index) in tokenBalances" :key="index">
              <v-card color="primary" @click="sendErc20(token)">

                <template v-slot:prepend>
                  <v-icon :icon="Menu"></v-icon>
                </template>
                <template v-slot:title>
                  {{ token.token.name }}
                </template>
                <template v-slot:subtitle>
                  {{ token.token.type }}
                </template>
                <template v-slot:append>
                  {{
                    token.token.decimals == null ? token.value :
                      formatUnits(token.value, token.token.decimals)
                  }}
                </template>
                <v-card-item-subtitle v-if="token.token_id != null">
                  #{{ token.token_id.slice(0, 20) }}...
                </v-card-item-subtitle>
                <v-card-item-subtitle>
                </v-card-item-subtitle>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>

      <div class="account-panel">

        <div class="account-panel__modals">
          <CreateStakeModal :close="reset" v-if="modal === 'createStake'" :visible="true"/>
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
          <ChargeModal :close="reset" :afterCharge="openPay" v-if="modal === 'charge'" :visible="true"
                       :label="'accountPanel'"/>
          <PayModal :close="closePay" :order="order" v-if="modal === 'pay'" :visible="true"/>
          <PayH5Modal :close="closePay" :order="order" v-if="modal === 'h5pay'" :visible="true"/>

          <v-dialog
            v-model="dialogVisible"
            :show-close="false"
            persistent
            :close-on-back="false"
            width="97%"
            max-width="36rem"
          >

            <v-card title="账户别名修改">
              <v-form ref="myForm">

                <v-list-item title="钱包名称:">
                  <v-text-field
                    v-model="walletName"
                    :rules="walletNameRules"
                    autocomplete="off"
                    label="输入一个钱包名称*"
                    id="charge-amount"
                    type="text"
                    required
                    clearable>
                  </v-text-field>
                </v-list-item>
              </v-form>
              <v-list-item>
                <v-row>
                  <v-col cols="6">
                    <v-btn
                      rounded="xl" block size="x-large"
                      variant="tonal"
                      @click="dialogVisible = false"
                    >
                      关闭
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      rounded="xl" block size="x-large" @click="createOnEnter">确认
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-card>
          </v-dialog>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import {fetchTokenBalance, queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'

import {mapState} from 'vuex'
import {getWalletName, setWalletName} from '../utils/storage'
import Amount from './Amount.vue'
import AuthBindModal from './index/AuthBindModal.vue'
import ChargeModal from './index/ChargeModal'
import PayModal from './index/PayModal'
import PayH5Modal from './index/PayH5Modal'
import BuyModal from './tx/BuyModal'
import ExchangeModal from './tx/ExchangeModal'
import ReceiveModal from './tx/ReceiveModal'
import SellModal from './tx/SellModal'
import SendModal from './tx/SendModal'
import SwapModal from './tx/SwapModal'
import {InfoFilled, Connection, EditPen, Menu} from '@element-plus/icons-vue'
import {ArrowDownIcon, ArrowUpIcon, ClipboardCopyIcon, ClockIcon, XCircleIcon} from '@heroicons/vue/outline'

// eslint-disable-next-line no-undef
const ethers = require('ethers')

export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    Amount,
    ReceiveModal,
    SellModal,
    BuyModal,
    SendModal,
    AuthBindModal,
    SwapModal,
    ExchangeModal,
    ChargeModal,
    PayH5Modal,
    PayModal
  },
  computed: mapState(['address', 'balance', 'xctBalance', 'cnyBalance', 'showAlert', 'alertMessage', 'alertType']),

  data() {
    return {
      tab: '余额',
      items: [
        '余额', '通证'
      ],
      modal: '',
      walletName: '',
      walletNameRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        }
      ],
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
      dialogVisible: false,
      isReceiveLoading: false,
      isMobile: false
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
    // 检测是否为移动端
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

    if (this.$route.query.modal) {
      this.modal = this.$route.query.modal
    }
    this.getTokenBalance()
  },
  methods: {
    formatUnits(value, decimals) {
      return ethers.utils.formatUnits(value, decimals)
    },
    sendErc20(token) {
      this.item = token
      this.item.type = token.token.type
      this.item.balance = token.value
      this.item.decimals = token.token.decimals
      this.item.name = token.token.name
      this.item.symbol = token.token.symbol
      this.modal = 'send'
    },
    dropDown(items) {
      switch (items.token.type) {
      case 'ERC-1155':
      case 'ERC-721':
        console.log(items)
        window.open(`https://ctblock.cn/token/${items.token.address}/instance/${items.token_id}`)
        break
      default:
        console.log(items)
        window.open(`https://ctblock.cn/token/${items.token.address}`)
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
    closeCharge() {
      this.modal = ''
    },
    openPay(order) {

      console.log(order)
      this.order = order
      if (this.isMobile) {
        this.modal = 'h5pay'
      }
      else {
        this.modal = 'pay'
      }
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
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
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
      const address = this.address
      queryCert({address: address})
        .then((res) => {
          if (res.code !== 200) {
            console.log(res.msg)

            if (res.msg == undefined) {
              this.$message.error('查询实名认证出错')
            }
            else {
              this.$message.error(res.msg)
            }
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
        this.$message.error('查询实名认证失败')
      }).finally(() => {
        this.isReceiveLoading = false
      })
    },
    async openReceive() {
      this.isReceiveLoading = true
      await this.authJudge('receive')
    },
    openSell() {
      this.modal = 'sell'
    },
    openBuy() {
      this.modal = 'buy'
    },
    openSend() {
      this.item = {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      }
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
  },
  setup() {
    return {ArrowUpIcon, ArrowDownIcon, Connection, ClipboardCopyIcon, EditPen, InfoFilled, Menu}
  }
}

</script>

<style scoped>
.scrollable-container {
  height: 70vh;
  overflow-y: auto;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.scrollable-container::-webkit-scrollbar-thumb {
  background-color: #888; /* 滚动条滑块颜色 */
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* 滑块悬停颜色 */
}

.scrollable-container::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* 滑道颜色 */
}
</style>
