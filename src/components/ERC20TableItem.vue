<template>
  <tr class="text-black">
    <td data-title="名称:">
      <span class=" monospace lg:font-sans lg:inline-block">
        {{ item.token.name }}
      </span>
    </td>

    <td data-title="符号:" :title="item.token.symbol">
      <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.token.symbol }}
        </span>
      </a>
    </td>

    <td data-title="余额:" class=" from-to" :title="formattedAmount">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ formattedAmount }}
          </span>
      </span>
    </td>
    <td data-title="类型:" class="from-to " :title="item.token.type">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ item.token.type }}
          </span>
      </span>
    </td>
    <td data-title="精度:" class="from-to " :title="item.token.decimals">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block">
            {{ item.token.decimals === '' ? 0 : item.token.decimals }}
          </span>
      </span>
    </td>

    <td data-title="操作:">
      <el-button type="success" @click="sendErc20(item)">发送</el-button>
    </td>
  </tr>
</template>

<script>
const ethers = require('ethers')
import {mapState} from 'vuex'

export default {
  name: 'ERC20TableItem',
  data() {
    return {
      modal: ''
    }
  },
  props: [
    'item',
    'sendErc20'
  ],
  components: {
  },
  computed: {
    ...mapState(['address']),
    date() {
      return new Date(this.item.timestamp * 1000).toLocaleString()
    },
    explorerToAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.token.address}`
    },
    formattedAmount() {
      return Number(ethers.utils.formatUnits(this.item.value, this.item.token.decimals))
    },
    sent() {
      return this.item.sender === this.item.recipient || this.address === this.item.sender
    }
  },
  mounted() {
  },
  methods: {}
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

  td:last-child {
    @apply pr-30 pb-10 border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>
