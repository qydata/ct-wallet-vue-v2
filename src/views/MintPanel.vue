<template>
  <div>
    <Header/>
    <AccountPanel/>

<!--    <div class="bg-gray-200 py-25">-->
<!--      <div class="container">-->
        <!--        <button :class="'button ' + tabModel == 'erc20' ? 'button&#45;&#45;success': 'button&#45;&#45;outline-success'" @click="openErc20">-->
<!--        <button :class="{-->
<!--        'button': true,-->
<!--        'button&#45;&#45;outline-success': true-->
<!--        }"-->
<!--                style="margin-right: 10px; color: black"-->
<!--                @click.prevent="openCreateCollect">-->
<!--          创建合约-->
<!--        </button>-->

<!--        <button :class="{-->
<!--        'button': true,-->
<!--        'button&#45;&#45;outline-success': true-->
<!--        }"-->
<!--                style="margin-right: 10px; color: black"-->
<!--                @click.prevent="openCreateNfts">-->
<!--          创建NFT-->
<!--        </button>-->
<!---->
<!--      </div>-->
<!--    </div>-->
    <div class="bg-gray-200 py-15">

      <div class="container">
        <ContractTable
          :dataList="contractList"
        />
      </div>
    </div>
    <CreateCollectModal :close="close" :afterCreate="openCollectInit" :visible="tabModel === 'createCollect'"/>
    <CreateNftModal :close="close" :createCollect="openCreateCollect" :afterCreate="afterNftCreate"
                    :visible="tabModel === 'createNfts'"/>
    <CollectInitModal :close="close" :afterInit="afterInit" :visible="tabModel === 'collectInit'"
                      :itemContract="itemContract"/>
    <SendModal :close="closeSendModal" :visible="model === 'send'" :item="item"/>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import ContractTable from '@/components/ContractTable'
import Header from '@/components/Header'
import CollectInitModal from '@/components/index/CollectInitModal'
import CreateCollectModal from '@/components/index/CreateCollectModal'
import CreateNftModal from '@/components/index/CreateNftModal'
import Menu from '@/components/Menu'
import SendModal from '@/components/tx/SendModal'
import {fetchDisplay} from '@/utils/api'
import * as storage from '@/utils/storage'

export default {
  name: 'ViewTransactions',
  title: 'NFT',
  data: function () {
    return {
      metadata: {totalCount: 0},
      limit: 20,
      tabModel: '',
      erc20List: [],
      nftList: [],
      item: null,
      itemContract: null,
      model: '',
      contractList: []
    }
  },
  watch: {
    tabModel(oldVal, newVal) {

    }
  },
  components: {
    AccountPanel,
    Header,
    CreateCollectModal,
    CreateNftModal,
    ContractTable,
    CollectInitModal,
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
  mounted() {
    this.getTokenList()
  },
  methods: {
    async getTokenList() {
      let _this = this

      let address = await storage.getAddress(storage.getHighestWalletVersion())

      fetchDisplay(address, {}).then((result) => {
        // console.log(result)
        let myNftsList = result.transactions
        // 这里只筛选721和1155的合约地址
        let contractList = []
        for (const iterator of myNftsList) {
          if (iterator.type == 'ERC-1155' || iterator.type == 'ERC-721') {
            let isExit = contractList.some(
              (value) => value.contractAddress == iterator.contractAddress
            )
            if (isExit == false) {
              contractList.push(iterator)
            }
          }
          continue
        }
        if (this.$route.query.newContractAddress) {
          let newMap = {}
          if (this.$route.query.defaultV.indexOf('721') == -1) {
            newMap.type = 'ERC-1155'
          }
          else {
            newMap.type = 'ERC-721'
          }

          newMap.contractAddress = this.$route.query.newContractAddress
          newMap.name = '新创建合约,请进行首次NFT创建'
          newMap.symbol = '新创建合约'
          contractList.push(newMap)
        }
        this.contractList = contractList
      })
    },

    afterNftCreate() {
      this.model = ''
      this.getTokenList()

    },
    afterInit(item) {
      this.$router.replace({query: {defaultV: item.defaultV, contractAddress: item.contractAddress}})
      this.tabModel = 'createNfts'
    },
    send(item) {
      this.item = item
      this.model = 'send'
    },
    closeSendModal(tabName) {
      this.model = ''
    },
    close() {
      this.tabModel = ''
    },
    openCreateCollect() {
      this.tabModel = 'createCollect'
    },
    openCollectInit(itemContract) {
      console.log(itemContract)
      this.itemContract = itemContract
      this.tabModel = 'collectInit'
    },
    openCreateNfts() {
      this.tabModel = 'createNfts'
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

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__buttons.staking-buttons > button {
    width: 170px;
  }

}
</style>
