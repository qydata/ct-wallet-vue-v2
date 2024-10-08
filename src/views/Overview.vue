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
            <Overviews :transactions="transactions"/>
          </p>
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
import {transactionsByAddress} from '../services/userService'

dayjs.extend(relativeTime)

export default {
  name: 'ViewOverview',
  title: '总览',
  data: function () {
    return {
      transactions: [],
      loading: true,
      error: '',
      limit: 5,
      polling: null,
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
    this.pollData()
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
    pollData() {
      let that = this
      this.polling = setInterval(async () => {
        const transactions = await transactionsByAddress(7, this.address)
        this.transactions = transactions.address.transactions.edges
        that.loading = false
      }, this.transactionRefreshInterval)
    }
  }
}
</script>
