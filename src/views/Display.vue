<template>
  <div>
    <Header/>
    <AccountPanel/>

    <div class="bg-gray-200 py-25">
      <div class="container">
        <v-btn v-bind:key="index" v-for="(items,index) in tabArray"
                   :type="tabModel === items.name?'success':'default'"
                   size="large"
                   @click="items.fun">
          {{ items.name }}
        </v-btn>
      </div>
    </div>
    <div class="bg-gray-200">

      <div class="container">
        <ERC20Table
          :limit="limit"
          :send="send"
          :transactions="transactions"
          :loaded="loaded"
          :loading="loading"
          v-if="tabModel === 'ERC-20'"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
        />
        <ERC721Table
          :limit="limit"
          :send="send"
          :transactions="transactions"
          :loaded="loaded"
          :loading="loading"
          v-if="tabModel === 'ERC-721'"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
        />
        <ERC1155Table
          :limit="limit"
          :send="send"
          :transactions="transactions"
          :loaded="loaded"
          :loading="loading"
          v-if="tabModel === 'ERC-1155'"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
        />
        <div class="mt-10">
          <el-pagination layout="prev, pager, next"
                         :current-page="currentPage"
                         background
                         @current-change="handlePage"
                         :total="transactionsAllPage.length"/>

        </div>

      </div>
    </div>
    <SendModal :close="closeSendModal" :visible="model === 'send'" :item="item"/>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import ERC1155Table from '@/components/ERC1155Table'
import ERC20Table from '@/components/ERC20Table'
import ERC721Table from '@/components/ERC721Table'
import Header from '@/components/Header'
import Pagination from '@/components/PaginationNew'
import SendModal from '@/components/tx/SendModal'
import {fetchTokenBalance} from '@/utils/api'
import {mapState} from 'vuex'

const txsRefreshInterval = 5 * 1000

export default {
  name: 'ViewTransactions',
  title: '通证',
  data: function () {
    return {
      metadata: {totalCount: 0},
      limit: 5,
      tabModel: 'ERC-20',
      nftList: [],
      otherList: [],
      iTransactions: 0,
      transactions: [],
      transactionsAll: [],
      transactionsAllPage: [],
      item: null,
      model: '',
      loaded: false,
      loading: false,
      tabArray: [
        {
          name: 'ERC-20', fun: () => {
            this.openErc20()
          }
        },
        {
          name: 'ERC-721', fun: () => {
            this.openErc721()
          }
        },
        {
          name: 'ERC-1155', fun: () => {
            this.openErc1155()
          }
        }
      ],
      currentPage: 1
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    ERC20Table,
    ERC721Table,
    ERC1155Table,
    SendModal
  },
  computed: {
    ...mapState(['address']),
    lastPage() {
      return Math.max(1, Math.ceil(this.transactions.length / this.limit))
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
    handlePage(val) {
      this.currentPage = val
      this.processTransactionPage()
    },
    processTransactionPage() {
      this.transactions = this.transactionsAllPage.slice((this.currentPage - 1) * this.limit, this.currentPage * this.limit)
      this.loading = false
    },
    async updateTransactions() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      let temoTrans = (await fetchTokenBalance(this.address)).data
      if (temoTrans && temoTrans.message != 'Not found') {
        console.log(temoTrans)
        this.transactionsAll = temoTrans
      }
      this.processTransaction()
    },
    send(item) {
      this.item = item
      this.item.type = item.token.type
      this.item.balance = item.value
      this.item.decimals = item.token.decimals
      this.item.name = item.token.name
      this.item.symbol = item.token.symbol
      this.model = 'send'
    },
    closeSendModal() {
      this.model = ''
    },
    openErc20() {
      this.transactionsAllPage = []
      this.tabModel = 'ERC-20'
      this.processTransaction()
    },
    openErc721() {
      this.transactionsAllPage = []
      this.tabModel = 'ERC-721'
      this.processTransaction()
    },
    openErc1155() {
      this.transactionsAllPage = []
      this.tabModel = 'ERC-1155'
      this.processTransaction()
    },
    processTransaction() {
      this.transactionsAllPage = []
      for (const tempErc20 of this.transactionsAll) {
        if (tempErc20 && tempErc20.token.type && tempErc20.token.type === this.tabModel) {
          this.transactionsAllPage.push(tempErc20)
        }
      }
      this.loaded = true
      this.processTransactionPage()
    },
    onTransactionsUpdate(metadata) {
      this.metadata = metadata
    }
  },
  watch: {
    tabModel(oldVal, newVal) {
      console.log(oldVal, newVal)
    },
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
