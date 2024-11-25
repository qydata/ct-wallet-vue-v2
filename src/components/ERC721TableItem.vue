<template>
  <tr>

    <td data-title="名称:">
      <span class="monospace lg:font-sans lg:inline-block text-black">
        {{ item.token.name }}
      </span>
    </td>

    <td data-title="符号:" :title="item.token.symbol">
        <span class="monospace lg:inline-block text-black">
          {{ item.token.symbol }}
        </span>
    </td>
    <td data-title="合约地址:" class="from-to" :title="item.token_id">
      <span>
        <span class="icon-wrap"></span>
        <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
          <span class="monospace lg:inline-block text-black">
            {{ item.token.address }}
          </span>
        </a>
      </span>
    </td>
    <td data-title="余额:" class="from-to" :title="item.value">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block text-black">
            {{ item.value }}
          </span>
      </span>
    </td>
    <!--    <td data-title="To:" class="from-to" :title="JSON.stringify(item.metadata)">-->
    <!--      <span>-->
    <!--        <span class="icon-wrap"></span>-->
    <!--          <span class="monospace lg:inline-block text-black">-->
    <!--            {{ item.metadata }}-->
    <!--          </span>-->
    <!--      </span>-->
    <!--    </td>-->
    <td data-title="类型:" class="from-to" :title="item.token.type">
      <span>
        <span class="icon-wrap"></span>
          <span class="monospace lg:inline-block text-black">
            {{ item.token.type }}
          </span>
      </span>
    </td>


    <td data-title="操作:">
      <el-button type="success" size="small" @click="sendNft(item)">发送</el-button>
    </td>
  </tr>
</template>

<script>
const ethers = require('ethers')
import {mapState} from 'vuex'

export default {
  name: 'NftTableItem',
  data() {
    return {
      modal: ''
    }
  },
  props: [
    'item',
    'sendNft'
  ],
  components: {},
  computed: {
    ...mapState(['address']),
    date() {
      return new Date(this.item.timestamp * 1000).toLocaleString()
    },
    explorerIdUrl() {
      return `https://ctblock.cn/token/${this.item.contractAddress}/instance/${this.item.id}/token-transfers`
    },
    explorerToAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/address/${this.item.token.address}`
    },
    sent() {
      return this.item.sender === this.item.recipient || this.address === this.item.sender
    }
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

td a {
  @apply border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
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
