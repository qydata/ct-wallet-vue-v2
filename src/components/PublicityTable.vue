<template>
  <table>
    <thead class="hidden lg:table-header-group">

    <tr>
      <th width="10%">订单号</th>
      <th width="15%">交易Hash</th>
      <th width="5%">赞成</th>
      <th width="5%">反对</th>
      <th width="10%">状态</th>
      <th width="15%">创建时间</th>
      <th width="15%">最后更新时间</th>
      <th width="5%">数额</th>
      <th width="20%">操作</th>
    </tr>
    </thead>
    <tbody v-if="publicitys.length">
    <PublicityTableItem
      v-for="item in publicitys"
      :key="item.id"
      :item="item"
      :openTrueAndFalsePublicityModal="openTrueAndFalsePublicityModal"
    />
    </tbody>
    <tbody v-else-if="!loaded && loading">
    <td colspan="10" class="text-black-100 block w-full text-center bg-white lg:table-cell py-35">
      正在载入...
    </td>
    </tbody>
    <tbody v-else>
    <tr>
      <td colspan="10" class="text-black-100 block w-full text-center bg-white lg:table-cell py-35">
        没有订单。
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>
/*global process*/

import PublicityTableItem from '@/components/PublicityTableItem'
import {chainpayOrderEvents} from '@/services/userService'
import {mapState} from 'vuex'

const stakesRefreshInterval = 5 * 1000

export default {
  name: 'PublicitysTable',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      publicitys: [],
      iPublicitys: null
    }
  },
  components: {
    PublicityTableItem
  },
  props: [
    'hideFalsePublicitys',
    'limit',
    'page',
    'receiveMetadata',
    'sortable',
    'openTrueAndFalsePublicityModal'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    this.updatePublicitys()
    // initiate polling
    this.iPublicitys = setInterval(() => {
      this.updatePublicitys()
    }, stakesRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iPublicitys)
  },
  methods: {
    async updatePublicitys() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const options = {
        limit: this.limit,
        page: this.page
      }
      if (this.hideFalsePublicitys) options.hideFalse = 1

      console.log(options)
      const publicitys = await chainpayOrderEvents(options.page - 1, options.limit, options.hideFalse)
      console.log(publicitys)
      if (typeof publicitys === 'string') {
        // 请求出错
      }
      else {
        this.publicitys = publicitys.chainpayOrderEvents

        this.receiveMetadata(publicitys)
        this.loaded = true
        this.loading = false
      }

    },
    updateSorting(newSortQuery) {
      const query = {...this.$route.query, sort: newSortQuery}
      if (!newSortQuery) delete query.sort
      this.$router.replace({query})
    }
  },
  watch: {
    page() {
      this.updatePublicitys()
    },
    sortQuery() {
      this.updatePublicitys()
    }
  }
}
</script>

<style scoped>
</style>
