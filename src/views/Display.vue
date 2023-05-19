<template>
  <div>
    <Header/>
    <AccountPanel/>

    <div class="bg-gray-200 py-25">
      <div class="container">
        <!--        <button :class="'button ' + tabModel == 'erc20' ? 'button&#45;&#45;success': 'button&#45;&#45;outline-success'" @click="openErc20">-->
        <button :class="{
        'button': true,
        'button--success': tabModel == 'erc20',
        'button--outline-success': tabModel != 'erc20'
        }"
                style="margin-right: 10px; color: black"
                @click="openErc20">
          通证
        </button>

        <button :class="{
        'button': true,
        'button--success': tabModel == 'nft',
        'button--outline-success': tabModel != 'nft'
        }"
                style="margin-right: 10px; color: black"
                @click="openNft">
          藏品
        </button>

        <button :class="{
        'button': true,
        'button--success': tabModel == 'other',
        'button--outline-success': tabModel != 'other'
        }" style="margin-right: 10px; color: black"
                @click="openOther">
          其它
        </button>
      </div>
    </div>
    <div class="bg-gray-200 py-15">

      <div class="container">
        <Erc20Table
          :limit="limit"
          :send="send"
          v-if="tabModel == 'erc20'"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
          :sortable="true"
        />
        <NftTable
          :limit="limit"
          :send="send"
          v-if="tabModel == 'nft'"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
          :sortable="true"
        />
        <OtherTable
          :limit="limit"
          :send="send"
          v-if="tabModel == 'other'"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
          :sortable="true"
        />
        <Pagination
          v-if="metadata.totalCount > limit"
          baseRoute="Transactions"
          :currentPage="currentPage"
          :limit="limit"
          :totalCount="metadata.totalCount"
        />
      </div>
    </div>
    <SendModal :close="closeSendModal" :visible="model === 'send'" :item="item"/>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Erc20Table from '@/components/Erc20Table'
import Header from '@/components/Header'
import Menu from '@/components/Menu'
import NftTable from '@/components/NftTable'
import OtherTable from '@/components/OtherTable'
import Pagination from '@/components/PaginationNew'
import TransactionsTable from '@/components/TransactionsTable'
import SendModal from '@/components/tx/SendModal'

export default {
  name: 'ViewTransactions',
  title: '展示',
  data: function () {
    return {
      metadata: {totalCount: 0},
      limit: 20,
      tabModel: 'erc20',
      erc20List: [],
      nftList: [],
      otherList: [],
      item: null,
      model: ''
    }
  },
  watch: {
    tabModel(oldVal, newVal) {

    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    TransactionsTable,
    Erc20Table,
    NftTable,
    OtherTable,
    Menu,
    SendModal
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    }
  },
  methods: {
    send(item) {
      this.item = item
      this.model = 'send'
    },
    closeSendModal(tabName) {
      this.model = ''
    },
    openErc20() {
      this.tabModel = 'erc20'
    },
    openNft() {
      this.tabModel = 'nft'
    },
    openOther() {
      this.tabModel = 'other'
    },
    onTransactionsUpdate(metadata) {
      this.metadata = metadata
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
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__left,
.account-panel__right {
  @apply w-full;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7 w-full;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__balance h3 {
  @apply text-green mb-5;
}

.account-panel__balance h2 {
  @apply text-gray-300 text-md mb-0;
}

.account-panel__balance h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

.account-panel__modals {
  width: 1px;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

  .account-panel__buttons.staking-buttons {
    @apply grid-cols-1;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__buttons.staking-buttons > button {
    width: 170px;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}
</style>
