<template>
  <Modal :close="close" :preventClickOutside="true" :showCloseButton="true" :visible="visible" :width="900">
    <template v-slot:header>
      <h2>交易<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
    </template>

    <template v-slot:body>
      <div class="grid grid-cols-1 gap-24 pt-12 pb-20 md:grid-cols-3">
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>充值草田分</strong>
            <p class="mb-25">充值草田分手续费，用来在API调用中使用。</p>
            <img src="/assets/recharge.svg" alt="质押从CT到XCT" class="account-panel__swap-img">
          </div>

          <button class="w-full button--outline-success button" @click="openCharge">
            <span class="w-12 button__icon">
              <ArrowNarrowLeftIcon/>
            </span>
            充值草田分
          </button>
        </div>
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>充值</strong>
            <p class="mb-25">在草天链网络上以 CNY 的价格充值。</p>
            <img src="/assets/buy.svg" alt="提现 从 RMB 到 CT" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openBuy">
            <span class="w-12 button__icon">
              <ArrowNarrowRightIcon/>
            </span>
            充值
          </button>
        </div>
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>提现</strong>
            <p class="mb-25">在草天链网络上以 CNY 的价格提现。</p>
            <img src="/assets/sell.svg" alt="以人民币的价格出售 CT" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openSell">
            <span class="w-12 button__icon">
              <CurrencyDollarIcon/>
            </span>
            提现
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal'
import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon, CurrencyDollarIcon } from '@heroicons/vue/outline'

export default {
  name: 'ExchangeModal',
  components: {
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    CurrencyDollarIcon,
    Modal
  },
  props: {
    close: Function,
    openDeposit: Function,
    openSell: Function,
    openWithdraw: Function,
    openBuy: Function,
    openCharge: Function,
    visible: Boolean
  }
}
</script>

<style scoped>
.account-panel__swap-img {
  height: 24px;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
