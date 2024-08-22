<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
      <tr>
        <th>名称</th>
        <th>符号</th>
        <th>余额</th>
        <th>类型</th>
        <th>TokenID</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody v-if="transactions.length">
      <ERC1155TableItem
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

import ERC1155TableItem from '@/components/ERC1155TableItem'
import {fetchDisplay} from '@/utils/api'
import {mapState} from 'vuex'


export default {
  name: 'Erc1155Table',
  data: function () {
    return {
      metadata: null,
      iTransactions: null
    }
  },
  components: {
    ERC1155TableItem
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

  methods: {
    sendNft(nftItem) {
      this.send(nftItem)
    },
    async updateTransactions() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url

      const {transactions} = await fetchDisplay(this.address,
        {limit: this.limit, page: this.page})
      // const sortQuery = this.$route.query.sort ? `${this.$route.query.sort},-timestamp` : '-timestamp'
      // const transactions = await index.tx.transactions(
      //   process.env.VUE_APP_INDEX_API_URL,
      //   this.address,
      //   {
      //     limit: this.limit,
      //     page: this.page,
      //     sort: sortQuery
      //   }
      // )
      this.transactions = []
      for (const transactionsKey in transactions) {
        let temperc20 = transactions[transactionsKey]
        if (temperc20 && temperc20.token.type && temperc20.token.type == 'ERC-1155') {
          this.transactions.push(temperc20)
        }
      }
      // if (this.receiveMetadata) this.receiveMetadata(transactions.metadata)
      this.loaded = true
      this.loading = false
    },
    updateSorting(newSortQuery) {
      const query = {...this.$route.query, sort: newSortQuery}
      if (!newSortQuery) delete query.sort
      this.$router.replace({query})
    }
  },
  watch: {
    page() {
      this.updateTransactions()
    },
    sortQuery() {
      this.updateTransactions()
    }
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
