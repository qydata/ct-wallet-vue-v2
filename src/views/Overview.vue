<template>
  <div>
    <Header/>
    <AccountPanel/>

    <div class="bg-gray-200 py-35">
      <div class="container">
        <div v-if="isTestnet" class="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <TestnetFaucet/>
          <RecentBlocks/>
        </div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <NewsPromo/>
          <RecentBlocks/>
        </div>

        <div class="mt-35">
          <h3 class="text-black">最近的交易</h3>
          <p class="text-black" v-if="loading">
            正在加载...
          </p>
          <p v-if="error">{{ error }}</p>

          <p v-if="!loading">
            <Overviews :overviews="overviews" :transactions="transactions"/>
          </p>
        </div>

        <!--        <Pagination-->
        <!--          v-if="transactionsAll.length > limit"-->
        <!--          :currentPage="currentPage"-->
        <!--          :limit="limit"-->
        <!--          :totalCount="transactionsAll.length"-->
        <!--        />-->
        <div class="grid grid-cols-2">
          <el-pagination layout="prev, pager, next"
                         :current-page="currentPage"
                         background
                         @current-change="handlePage"
                         :total="transactionsAll.length"/>
          <div class="w-full text-right" v-if="transactions.length">
            <el-button type="success" @click="open(`https://ctblock.cn/address/${address}`)">展示所有
            </el-button>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script>
/*global process*/
import AccountPanel from '@/components/AccountPanel'
import TestnetFaucet from '@/components/Faucet'
import Header from '@/components/Header'
import NewsPromo from '@/components/NewsPromo'
import Overviews from '@/components/Overviews'
import RecentBlocks from '@/components/RecentBlocks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {mapState} from 'vuex'
import {fetchTransactions} from '../utils/api'

dayjs.extend(relativeTime)

export default {
  name: 'ViewOverview',
  title: '总览',
  data: function () {
    return {
      transactions: [],
      transactionsAll: [],
      loading: true,
      error: '',
      limit: 5,
      polling: null,
      overviews: [],
      currentPage: 1,
      transactionRefreshInterval: 5000,
      isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
    }
  },
  components: {
    AccountPanel,
    Overviews,
    Header,
    NewsPromo,
    RecentBlocks,
    TestnetFaucet
  },
  computed: mapState(['address']),
  mounted() {
    this.initialise()
    let RE_HREF = sessionStorage.getItem('RE_HREF')
    let RE_HREF_S = sessionStorage.getItem('RE_HREF_S')

    if (RE_HREF != null) {
      sessionStorage.removeItem('RE_HREF')
      sessionStorage.removeItem('RE_HREF_S')
      this.$router.push(RE_HREF + RE_HREF_S)
    }
  },
  unmounted() {
    clearInterval(this.polling)
  },
  methods: {
    open(url) {
      window.open(url)
    },
    handlePage(val) {
      this.currentPage = val
      this.processTransaction()
    },
    async initialise() {
      await this.updateTransactions()
      this.pollData()
    },
    async updateTransactions() {
      const {transactions} = await fetchTransactions(this.address, {limit: 5})
      this.transactionsAll = transactions
      this.processTransaction()
    },
    processTransaction() {
      this.transactions = this.transactionsAll.slice((this.currentPage - 1) * this.limit, this.currentPage * this.limit)
      this.loading = false
    },
    pollData() {
      this.polling = setInterval(() => {
        this.updateTransactions()
      }, this.transactionRefreshInterval)
    }
  }
}
</script>
