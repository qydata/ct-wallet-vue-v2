<template>
  <div class="w-full">
    <h3 class="text-black">最近的区块</h3>

    <table class="w-full">
      <thead class="hidden lg:table-header-group">
      <tr>
        <th width="20%" class="whitespace-nowrap">区块高度</th>
        <th width="25%" class="whitespace-nowrap">哈希</th>
        <th width="10%" class="whitespace-nowrap">交易数</th>
        <th width="25%" class="whitespace-nowrap amount-col">总草田分</th>
        <th width="20%" class="whitespace-nowrap">已验证</th>
      </tr>
      </thead>
      <tbody v-if="loading">
      <tr>
        <td colspan="5" class="text-black-100 py-35 bg-white w-full text-center">
          正在加载最新的区块列表...
        </td>
      </tr>
      </tbody>
      <tbody v-if="blocks.length">
      <tr v-for="block in blocks" :key="block.hash">
        <td data-title="区块高度:">
          <!-- eslint-disable-next-line max-len -->
          <a :href="`${explorerUrl}/block/${block.height}`" target="_blank" rel="noreferrer"
             class="monospace text-black lg:inline-block">
            {{ block.height }}
          </a>
        </td>
        <td data-title="哈希:" :title="block.hash">
          <a :href="`${explorerUrl}/block/${block.hash}`" target="_blank" rel="noreferrer">
            <span class="monospace  text-black lg:inline-block">{{ block.hash }}</span>
          </a>
        </td>
        <td data-title="交易数:">
          <span class="monospace  text-black lg:inline-block">{{ block.tx_count }}</span>
        </td>
        <td data-title="总草田分:" class="amount-col">
          <span class="monospace  text-black lg:inline-block">{{ formatAmount(block.tx_fees) }}</span>
        </td>
        <td data-title="已验证:" class="text-gray-600 lg:text-gray">
                    <span class="lg:inline-block">
                      <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon/></span>
                      <span class="monospace lg:font-sans lg:text-gray">
                        {{ timeSince(block.timestamp) }}
                      </span>
                    </span>
        </td>
      </tr>
      </tbody>
    </table>
    <!--    <div class="w-full text-right my-20">-->
    <!--      <el-button type="success" @click="open(`https://ctblock.cn/blocks`)">展示所有-->
    <!--      </el-button>-->
    <!--    </div>-->
  </div>
</template>

<script>
/*global process*/
import {ClockIcon} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import moment from 'moment'
import {fetchBlocks} from '../utils/api'

moment.locale('zh-cn') //设置语言 或 moment.lang('zh-cn');
moment.suppressDeprecationWarnings = true

const ethers = require('ethers')
export default {
  name: 'RecentBlocks',
  data: function () {
    return {
      explorerUrl: process.env.VUE_APP_EXPLORER_URL || 'https://ctblock.cn',
      loading: false,
      polling: null,
      blocks: [],
      isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
    }
  },
  components: {
    ClockIcon
  },
  mounted() {
    this.loading = true
    this.fetchBlocks()
    this.pollData()
    this.formatDate()
  },
  methods: {
    open(url) {
      window.open(url)
    },
    formatDate(date_time_str) {

      // let date_time_str = '2023-05-09 07:10:37.000000Z'
      const formattedDate = dayjs(date_time_str).format('YYYY/MM/DD HH:mm:ss')
      return formattedDate
    },
    async fetchBlocks() {
      const limit = this.isTestnet ? 5 : 6
      const tempBlocks = await fetchBlocks({limit})
      let tempBlocks1
      if (tempBlocks) {
        tempBlocks1 = [...tempBlocks, ...this.blocks]

      }
      else {
        tempBlocks1 = [...this.blocks]
      }

      const newObj = {}
      const repeatData = tempBlocks1.reduce((preVal, curVal) => {
        newObj[curVal.height] ? '' : newObj[curVal.height] = preVal.push(curVal)
        return preVal
      }, [])
      this.blocks = repeatData.slice(0, limit)

      this.loading = false
    },
    formatAmount(amount) {
      return ethers.utils.formatEther(amount)
    },
    pollData() {
      this.polling = setInterval(() => {
        this.fetchBlocks()
      }, 10000)
    },
    timeSince(ts) {
      return moment(ts).fromNow()
    }
  }
}
</script>

<style scoped>
table, tbody, tr {
  @apply block;
}

table {
  @apply w-full table-fixed
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 px-5 border-b-2 border-gray-200 py-8 leading-tight;
}

th.amount-col {
  @apply text-right pr-30
}

th:last-child {
  @apply rounded-r-4;
}

td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full leading-tight;
}

td a {
  @apply border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

td span {
  @apply w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
}

td a {
  @apply overflow-ellipsis overflow-hidden whitespace-nowrap;
}

td::before {
  content: attr(data-title);
  @apply font-normal mr-8 min-w-100 text-xs text-gray-600 pt-2;
}

td:first-child {
  @apply rounded-l-4 pt-8;
}

td:last-child {
  @apply rounded-r-4 pb-8 border-b-4 border-gray-200;
}

td .icon {
  @apply w-15 inline-block align-middle;
}

td .icon-grey {
  @apply lg:text-gray-400;
}

@screen lg {
  tbody {
    @apply table-row-group;
  }

  table {
    @apply table;
  }

  tr {
    @apply table-row;
  }

  th {
    @apply pt-13 pb-13 pr-30 pb-13;
  }

  th:first-child {
    @apply pl-20 pt-13;
  }

  td {
    @apply border-gray-200 pt-13 pb-13 table-cell border-b-2 align-middle;
  }

  td.amount-col {
    @apply text-right pr-30;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td:last-child {
    @apply pr-30 pb-13 border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>
