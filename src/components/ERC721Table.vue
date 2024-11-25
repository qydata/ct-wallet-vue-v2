<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">

      <tr>
        <th>名称</th>
        <th>符号</th>
        <th>合约地址</th>
        <th>余额</th>
        <th>类型</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody v-if="transactions.length">
      <ERC721TableItem
        v-for="(item, index) in transactions"
        :key="index"
        :item="item"
        :sendNft="sendNft"
      />
      </tbody>
      <tbody v-else-if="!loaded && loading">
      <td colspan="12" class="text-black block w-full text-center bg-white lg:table-cell py-35">
        正在载入...
      </td>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="12" class="block w-full text-center bg-white lg:table-cell py-35 text-black">
          没有数字NFT.
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import ERC721TableItem from '@/components/ERC721TableItem'
import {mapState} from 'vuex'

const txsRefreshInterval = 5 * 1000

export default {
  name: 'Erc20Table',
  data: function () {
    return {
      metadata: null,
      iTransactions: null
    }
  },
  components: {
    ERC721TableItem
  },
  props: [
    'limit',
    'page',
    'receiveMetadata',
    'transactions',
    'loaded',
    'loading',
    'send'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
  },
  unmounted() {
  },
  methods: {
    sendNft(nftItem) {
      this.send(nftItem)
    },
    updateSorting(newSortQuery) {
      const query = {...this.$route.query, sort: newSortQuery}
      if (!newSortQuery) delete query.sort
      this.$router.replace({query})
    }
  },
  watch: {
  }
}
</script>

<style scoped>
table {
  @apply w-full table-fixed
}

table, tbody, tr {
  @apply block;
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200 py-13 px-5;
}

th:first-of-type {
  @apply pl-20;
}

th.amount-col {
  @apply text-right
}

th .icon {
  @apply w-15 inline-block align-middle text-gray-400;
}

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row;
  }
}
</style>
