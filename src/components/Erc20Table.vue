<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
      <tr v-if="sortable">
        <TableHeader width="15%" header="名称" :sortQuery="sortQuery"
                     sortParam="timestamp" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="15%" header="符号" :sortQuery="sortQuery"
                     sortParam="hash" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="20%" header="余额" :sortQuery="sortQuery"
                     sortParam="sortAddress" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="15%" header="类型" :sortQuery="sortQuery"
                     sortParam="data.memo" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="20%" header="精度" :sortQuery="sortQuery"
                     sortParam="block.height" :onSortingUpdate="updateSorting"
        />
        <TableHeader class="amount-col" width="15%" header="操作" :sortQuery="sortQuery"
                     sortParam="amount" :onSortingUpdate="updateSorting"
        />
      </tr>
      <tr v-else>
        <th width="15%">名称</th>
        <th width="15%">符号</th>
        <th width="20%">余额</th>
        <th width="15%">精度</th>
        <th width="20%">类型</th>
        <th width="15%">操作</th>
      </tr>
      </thead>
      <tbody v-if="transactions.length">
      <Erc20TableItem
        v-for="(item, index) in transactions"
        :key="index"
        :item="item"
        :sendErc20="sendErc20"
      />
      </tbody>
      <tbody v-else-if="!loaded && loading">
      <td colspan="12" class="block w-full text-center bg-white lg:table-cell py-35">
        正在载入...
      </td>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="12" class="block w-full text-center bg-white lg:table-cell py-35">
          没有通证.
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
/*global process*/

import Erc20TableItem from '@/components/Erc20TableItem'
import TableHeader from '@/components/TableHeader'
import {fetchDisplay} from '@/utils/api'
import {mapState} from 'vuex'

const txsRefreshInterval = 5 * 1000

export default {
  name: 'Erc20Table',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      transactions: [],
      iTransactions: null
    }
  },
  components: {
    TableHeader,
    Erc20TableItem
  },
  props: [
    'limit',
    'page',
    'receiveMetadata',
    'sortable',
    'send'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    this.updateTransactions()
    // initiate polling
    this.iTransactions = setInterval(() => {
      this.updateTransactions()
    }, txsRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iTransactions)
  },
  methods: {
    sendErc20(erc20Item) {
      this.send(erc20Item)
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
        if (temperc20 && temperc20.type && temperc20.type == 'ERC-20') {
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
