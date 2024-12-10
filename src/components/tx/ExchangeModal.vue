<template>
  <v-dialog
    persistent
    :close-on-back="false"
    max-width="36rem"
    v-model="localVisible" :close="close"
    :showCloseButton="true">

    <template v-slot:default="{ isActive }">
      <v-card rounded="lg">
        <v-alert v-if="showAlert" type="error" dismissible>
          {{ alertMessage }}
        </v-alert>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            交易
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="close"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>

            <v-col cols="12" md="4" align="center">
              <v-card-item title="充值草田分" subtitle="充值草田分手续费，用来在API调用中使用。">
                <v-img :width="100" :height="100"
                       aspect-ratio="16/9" src="/assets/recharge.svg" alt="质押从CT到XCT"/>
                <v-btn :prepend-icon="ArrowNarrowLeftIcon"
                       :loading="chargeCTLoading"
                       @click="()=>{
                         chargeCTLoading = true;
                         try {
                            openCharge()
                         } catch (e) {
                           console.log(e)
                         }finally {
                           chargeCTLoading = false;
                         }

                       }">
                  充值草田分
                </v-btn>
              </v-card-item>
              <v-divider/>
            </v-col>
            <v-col cols="12" md="4" align="center">
              <v-card-item title="充值" subtitle="在草田链网络上以 CNY 的价格充值。">
                <v-img :width="100" :height="100"
                       aspect-ratio="16/9" src="/assets/buy.svg" alt="提现 从 RMB 到 CT"/>
                <v-btn :prepend-icon="ArrowNarrowRightIcon"
                       @click="()=>{
                         showAlert = true;
                         alertMessage = '暂未开放';
                         // openBuy()
                       }">>
                  充值
                </v-btn>
              </v-card-item>
              <v-divider/>
            </v-col>
            <v-col cols="12" md="4" align="center">
              <v-card-item title="提现" subtitle="在草田链网络上以 CNY 的价格提现。">
                <v-img :width="100" :height="100"
                       aspect-ratio="16/9" src="/assets/sell.svg" alt="以人民币的价格出售 CT"/>
                <v-btn :prepend-icon="CurrencyDollarIcon"
                       @click="()=>{
                         showAlert = true;
                         alertMessage = '暂未开放';
                         // openSell()
                       }">
                  提现
                </v-btn>
              </v-card-item>
              <v-divider/>
            </v-col>
          </v-row>
          <v-card-item/>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import Modal from '../Modal'
import {ArrowNarrowLeftIcon, ArrowNarrowRightIcon, CurrencyDollarIcon} from '@heroicons/vue/outline'

export default {
  name: 'ExchangeModal',
  components: {
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    CurrencyDollarIcon,
    Modal
  },

  data() {
    return {
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible,
      chargeCTLoading: false,
      showAlert: false,
      alertMessage: false
    }
  },
  props: {
    close: Function,
    openDeposit: Function,
    openSell: Function,
    openWithdraw: Function,
    openBuy: Function,
    openCharge: Function,
    visible: Boolean
  },

  watch: {
    visible(newValue) {
      // 当父组件的 prop 更新时，更新本地副本
      this.localVisible = newValue
    },
    localVisible(newValue) {
      // 当本地副本改变时，触发事件通知父组件更新
      this.$emit('update:visible', newValue)
    }
  },
  setup() {
    return {CurrencyDollarIcon, ArrowNarrowRightIcon, ArrowNarrowLeftIcon}
  }
}
</script>

<style scoped>
</style>

<script setup lang="ts">
</script>
