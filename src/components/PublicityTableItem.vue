<template>
  <tr>
    <td data-title="订单号:">
      <el-popover>
        <template #reference>
        <span class="w-full text-black-100 monospace lg:inline-block">
          {{ item.id }}
        </span>
        </template>
        <template #default>
          {{ item.id }}
        </template>
      </el-popover>

    </td>

    <td data-title="交易Hash:">
      <a :href="explorerTxUrl" target="_blank" rel="noreferrer">
        <el-popover>
          <template #reference>
        <span class="text-black-100 w-full  monospace lg:inline-block">
          {{ item.transactionHash }}
        </span>
          </template>
          <template #default>
            {{ item.transactionHash }}
          </template>
        </el-popover>

      </a>
    </td>

    <td data-title="赞成:">
      <el-popover>
        <template #reference>
        <span class="monospace text-black-100 lg:inline-block">
        {{ item._chainpayOrder_trues.length }}
      </span>
        </template>
        <template #default>
          <div
            v-for="(item, index) in item._chainpayOrder_trues"
            :key="index"
          >{{ index }}: {{ item }}
          </div>
        </template>
      </el-popover>
    </td>

    <td data-title="反对:">
      <el-popover>
        <template #reference>
       <span class="monospace text-black-100 lg:inline-block">
        {{ item._chainpayOrder_falses.length }}
      </span>
        </template>
        <template #default>
          <div
            v-for="(item, index) in item._chainpayOrder_falses"
            :key="index"
          >{{ index }}: {{ item }}
          </div>
        </template>
      </el-popover>

    </td>

    <td data-title="状态:">
      <span>
        <div>
          <el-tag v-if="item._chainpayOrder_state==0"
                  effect="dark" round class="font-bold"
                  type="info">
          待确认
        </el-tag>
        <el-tag v-else-if="item._chainpayOrder_state ==1"
                effect="dark" round class="font-bold"
                type="warning">
          等待人工
        </el-tag>
        <el-tag v-else-if="item._chainpayOrder_state ==2"
                effect="dark" round class="font-bold"
                type="success">
          交易成功
        </el-tag>
        <el-tag v-else-if="item._chainpayOrder_state ==3"
                effect="dark" round class="font-bold w-auto"
                type="danger">
          交易失败
        </el-tag>
        </div>
      </span>
    </td>

    <td data-title="创建时间:">
      <span class="monospace text-black-100 lg:inline-block">{{ formatDate(item._chainpayOrder_createAt) }}</span>
    </td>

    <td data-title="创建时间:">
      <span class="monospace text-black-100 lg:inline-block">{{ formatDate(item._chainpayOrder_updateAt) }}</span>
    </td>

    <td data-title="数额:" :title="item._chainpayOrder_value">
      <span class="monospace text-black-100 lg:inline-block">{{ item._chainpayOrder_value }}</span>
    </td>

    <td data-title="">
      <v-btn
        :disabled="item._chainpayOrder_state != 0"
        type="success"
        class="font-bold"
        @click="openModal(true)"
      >
        赞成
      </v-btn>
      <v-btn
        :disabled="item._chainpayOrder_state != 0"
        type="warning"
        class="font-bold"
        @click="openModal(false)"
      >
        反对
      </v-btn>
    </td>
  </tr>
</template>

<script>
/*global process*/
import {ArrowCircleDownIcon, CheckCircleIcon, ClockIcon, DotsCircleHorizontalIcon} from '@heroicons/vue/outline'

const moment = require('moment')

const ethers = require('ethers')
export default {
  name: 'PublicitysTableItem',
  props: ['item', 'openTrueAndFalsePublicityModal'],
  components: {
  },
  computed: {
    address() {
      return this.item.tx.recipient
    },
    explorerTxUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/tx/${this.item.transactionHash}`
    },
    explorerWalletUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.address}`
    }
  },
  methods: {
    openModal(action) {
      return this.openTrueAndFalsePublicityModal(this.item, action)
    },
    formatDate(timestamp) {
      if (timestamp == 0) {
        return 0
      }
      else {
        const date = moment.unix(timestamp)
        return date.format('YYYY-MM-DD HH:mm:ss')
        // "2023-08-17 16:00:00"
      }
    }
  }
}
</script>

<style scoped>
</style>

