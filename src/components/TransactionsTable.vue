<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">

      <tr>
        <th width="15%">区块</th>
        <th width="30%">交易哈希</th>
        <th width="30%">从/到</th>
        <!--        <th width="30%">附加数据</th>-->
        <th width="15%">状态</th>
        <th class="amount-col" width="10%">草田分数量</th>
      </tr>
      </thead>
      <tbody v-if="transactions.length">
      <TransactionsTableItem
        v-for="(item, index)  in transactions"
        :key="index"
        :item="item.node"
      />
      </tbody>
      <tbody v-else-if="!loaded && loading">
      <td colspan="6" class="block w-full text-center bg-white lg:table-cell py-35">
        正在载入...
      </td>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="6" class="text-black-100 block w-full text-center bg-white lg:table-cell py-35">
          没有交易.
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import TransactionsTableItem from '@/components/TransactionsTableItem'
import {mapState} from 'vuex'

export default {
  name: 'TransactionsTable',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      iTransactions: null
    }
  },
  components: {
    TransactionsTableItem
  },
  props: [
    'page',
    'receiveMetadata',
    'transactions'
  ],
  computed: {
    ...mapState(['address'])
  },

  methods: {},
  watch: {}
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
