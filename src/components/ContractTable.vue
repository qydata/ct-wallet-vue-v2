<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">

      <tr>
        <th width="30%">名称</th>
        <th width="60%">符号</th>
        <th width="10%">类型</th>
      </tr>
      </thead>
      <tbody v-if="dataList.length">
      <ContractTableItem
        v-for="(item, index) in dataList"
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
          没有合约.
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
/*global process*/

import ContractTableItem from '@/components/ContractTableItem'
import TableHeader from '@/components/TableHeader'
import {mapState} from 'vuex'

export default {
  name: 'Erc20Table',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      iTransactions: null
    }
  },
  components: {
    TableHeader,
    ContractTableItem
  },
  props: {
    dataList: Array
  },
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    console.log(this.dataList)
  },
  unmounted() {
    clearInterval(this.iTransactions)
  },
  methods: {
    sendErc20(erc20Item) {
      this.send(erc20Item)
    },

    updateSorting(newSortQuery) {
      const query = {...this.$route.query, sort: newSortQuery}
      if (!newSortQuery) delete query.sort
      this.$router.replace({query})
    }
  },
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
