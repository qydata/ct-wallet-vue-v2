<template>
  <tr :class="item.pending && 'pending'">
    <td data-title="日期:">
      <span class="monospace text-black lg:font-sans lg:inline-block">
        {{ date }}
      </span>
    </td>

    <td data-title="交易哈希:" :title="item.hash">
      <a :href="explorerTxUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.hash }}
        </span>
      </a>
    </td>

    <td v-if="sent" data-title="到:" class="from-to" :title="item.to==null?'':item.to.hash">
      <span>
        <span class="icon-wrap"><ArrowUpIcon class="icon inline-icon icon-red"/></span>
        <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
          <span class="monospace lg:inline-block">
            {{ item.to == null ? '' : item.to.hash }}
          </span>
        </a>
      </span>
    </td>
    <td v-else data-title="从:" class="from-to" :title="item.from.hash">
      <span>
        <span class="icon-wrap"><ArrowDownIcon class="icon inline-icon icon-green"/></span>
        <a :href="explorerFromAddressUrl" target="_blank" rel="noreferrer">
          <span class="monospace lg:inline-block">
            {{ item.from.hash }}
          </span>
        </a>
      </span>
    </td>

    <!--    <td data-title="备忘录:" :title="item.description || 'None'">-->
    <!--      <span class="monospace lg:font-sans lg:inline-block" :class="!item.description && 'text-gray'">-->
    <!--        {{ item.description || 'None' }}-->
    <!--      </span>-->
    <!--    </td>-->

    <td data-title="状态:">
      <span v-if="isConfirmed">
        <span class="mr-1 -mt-2 icon icon-green"><CheckCircleIcon/></span>
        <span class="monospace text-green lg:font-sans">{{ statusFormatted }}</span>
      </span>
      <span v-else>
        <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon/></span>
        <span class="monospace lg:font-sans text-gray">{{ statusFormatted }}</span>
      </span>
    </td>

    <td data-title="草田分数量:" class="amount-col" :title="`${sent ? '-' : ''}${formattedAmount}`">
      <span class="monospace  text-black">
        {{ `${sent && formattedAmount < 0 ? '-' : ''}${formattedAmount}` }}
      </span>
    </td>
  </tr>
</template>

<script>
/*global process*/

const ethers = require('ethers')
import {ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, ClockIcon} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import {mapState} from 'vuex'

export default {
  name: 'StakesTableItem',
  props: [
    'item'
  ],
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ClockIcon
  },
  computed: {
    ...mapState(['address']),
    date() {
      // return this.item.timestamp
      const formattedDate = dayjs(this.item.timestamp).format('YYYY/MM/DD HH:mm:ss')
      return formattedDate
    },
    explorerFromAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.from.hash}`
    },
    explorerToAddressUrl() {
      if(this.item.to == null) {
        return `${process.env.VUE_APP_EXPLORER_URL}/address/0x000000000000000000000000000000000000000000`
      }
      else {
        return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.to.hash}`
      }
    },
    explorerTxUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/tx/${this.item.hash}`
    },
    formattedAmount() {
      return ethers.utils.formatEther(this.item.value)
    },
    isConfirmed() {
      return ((this.item.confirmations || 0) >= 5)
    },
    statusFormatted() {
      if (this.item.pending) return '确认中'
      if (this.item.confirmations === 1) return `${this.item.confirmations} 确认`
      if (this.item.confirmations < 5) return `${this.item.confirmations} 确认`
      return '已确认'
    },
    sent() {
      // return this.item.sender === this.item.recipient || this.address === this.item.sender
      return this.item.from.hash.toLowerCase() === this.address.toLowerCase()
    }
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full pb-4 leading-tight;
}

td span {
  @apply w-full overflow-ellipsis overflow-hidden whitespace-nowrap
}

td a {
  @apply overflow-ellipsis overflow-hidden whitespace-nowrap
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

td .inline-icon {
  @apply inline-block mb-2 lg:mb-0
}

td .icon-green {
  @apply text-green;
}

td .icon-grey {
  @apply text-gray-400;
}

td .icon-red {
  @apply text-red;
}

td a {
  @apply border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

tr.pending {
  @apply italic text-gray-400
}

tr.pending a {
  @apply italic text-gray-400
}

td.from-to span {
  @apply lg:w-11/12;
}

.icon-wrap {
  @apply max-w-max
}

@screen lg {
  td {
    @apply border-gray-200 pt-13 pb-10 table-cell border-b-2 align-middle;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td.amount-col {
    @apply text-right
  }

  td:last-child {
    @apply pr-30 pb-10 text-right border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>
