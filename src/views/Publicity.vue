<template>
  <div>
    <Header/>
    <AccountPanel view="publicity"/>

    <TrueAndFalsePublicityModal
      :close="closeTruePublicityModal"
      :visible="true" v-if="showTrueAndFalsePublicityModal"
      :p_type="p_type"
      :publicity="publicity"
    />

    <div class="bg-gray-200 py-35">
      <div class="container">
        <div class="checkbox-container">

          <el-checkbox
            v-model="hideFalsePublicitys"
            size="large"
            style="color: black;"
            label="只显示人工订单"
            @change="updateHideFalsePublicitys"/>
        </div>
        <PublicityTable
          :hideFalsePublicitys="hideFalsePublicitys"
          :limit="limit"
          :receiveMetadata="onPublicitysUpdate"
          :page="currentPage"
          :sortable="true"
          :openTrueAndFalsePublicityModal="openTrueAndFalsePublicityModal"
        />
        <Pagination
          v-if="metadata.totalCount > limit"
          baseRoute="Publicity"
          :currentPage="currentPage"
          :limit="limit"
          :totalCount="metadata.totalCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import Pagination from '@/components/PaginationNew'
import TrueAndFalsePublicityModal from '@/components/publicity/TrueAndFalsePublicityModal'
import PublicityTable from '@/components/PublicityTable'

export default {
  name: 'ViewStaking',
  data: function () {
    return {
      showTrueAndFalsePublicityModal: false,
      publicity: null,
      p_type: false,
      metadata: {totalCount: 0},
      limit: 20
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    PublicityTable,
    TrueAndFalsePublicityModal
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    hideFalsePublicitys() {
      return this.$route.query.hideFalsed === '1' || false
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    }
  },
  methods: {
    closeTruePublicityModal() {
      this.publicity = null
      this.showTrueAndFalsePublicityModal = false
    },
    onPublicitysUpdate(metadata) {
      this.metadata = metadata
    },
    openTrueAndFalsePublicityModal(publicity, p_type) {
      this.publicity = publicity
      this.p_type = p_type
      this.showTrueAndFalsePublicityModal = true
    },
    updateHideFalsePublicitys() {
      const hideFalsed = !this.hideFalsePublicitys ? 1 : undefined
      const query = {...this.$route.query, hideFalsed}
      this.$router.replace({query})
    }
  },
  watch: {
    metadata() {
      const numRegEx = /^[-+]?\d*$/
      if (this.$route.query.page) {
        if (this.$route.query.page < 1 || !numRegEx.test(this.$route.query.page)) {
          this.$router.replace({query: {...this.$route.query, page: 1}})
        }
      }
      // eslint-disable-next-line max-len
      if (this.currentPage > this.lastPage) this.$router.replace({query: {...this.$route.query, page: this.lastPage}})
    }
  }
}
</script>

<style scoped>
</style>

