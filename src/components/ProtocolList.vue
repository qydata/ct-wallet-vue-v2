<template>
  <div>
    <div @click.prevent="showList">
      <div class="selectList">
        <span class="item">
          {{ selectOne().labelName }}
        </span>
        <span class="pointer-events-none header-tools__icon--expand">
        <ChevronDownIcon/>
        </span>
      </div>
    </div>
    <ul class="header-tools" :class="showTools ? 'showTools' : 'hideTools'">
      <li class="header-tools__item" v-for="(item, index) in contractList" :key="index">
        <div class="header-tools__link" @click="itemClick(item)">
          <span class="header-tools__icon">
            <Tickets :class="{'green':defaultV == item.contractName}"/>
          </span>
          {{ item.labelName }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {ChevronDownIcon, CogIcon, KeyIcon, LockOpenIcon, LogoutIcon, PlusIcon, UserIcon} from '@heroicons/vue/outline'
import vClickOutside from 'click-outside-vue3'
import {Tickets} from '@element-plus/icons-vue'

const ABI_const = require('@/contract/ABI_const.js')

export default {
  name: 'HeaderTools',
  components: {
    ChevronDownIcon,
    Tickets
  },
  data: function () {
    return {
      showTools: false,
      defaultV: 'ERC721Ctnft',
      contractList: [
        {
          contract: ABI_const['ERC721Ctnft'],
          labelName: '721协议合约',
          contractName: ABI_const['ERC721Ctnft'].contractName
        },
        {
          contract: ABI_const['ERC1155Ctnft'],
          labelName: '1155协议合约',
          contractName: ABI_const['ERC1155Ctnft'].contractName
        },
        {
          contract: ABI_const['ERC1155CtnftOwner'],
          labelName: '1155协议合约(只有创建者可以铸造)',
          contractName: ABI_const['ERC1155CtnftOwner'].contractName
        }
      ],
      contractAddress: '',
      loading: false
    }
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  methods: {
    itemClick(item) {
      this.showTools = false
      this.defaultV = item.contractName
    },
    showList() {
      console.log('showList', this.showTools)
      this.showTools = !this.showTools
    },
    selectOne() {
      const ObList = this.contractList
      for (const obListElement of ObList) {
        if (obListElement.contractName == this.defaultV) {
          this.updateData(obListElement.contractName)
          return obListElement
        }
      }
      this.updateData(ABI_const['ERC721Ctnft'].contractName)
      return {
        contract: ABI_const['ERC721Ctnft'],
        labelName: '721协议合约',
        contractName: ABI_const['ERC721Ctnft'].contractName
      }
    }
  },
  props: {
    openForgetWalletModal: Function,
    openExportKeyModal: Function,
    openCreateModal: Function,
    openAuthBindModal: Function,
    updateData: Function
  }
}
</script>

<style scoped>
.header-tools {
  @apply mt-auto px-15 flex-shrink-0;
}

.header-tools.showTools {
  @apply block md:flex;
}

.header-tools.hideTools {
  @apply block md:hidden;
}

.header-tools__expand {
  @apply hidden md:flex items-center text-gray transition-colors hover:text-white;
}

.header-tools__link {
  @apply flex items-center text-gray transition-colors hover:text-white p-12;
}

.header-tools__link--red {
  @apply text-red hover:text-red-500;
}

.header-tools__icon {
  @apply block flex-shrink-0 mr-7 w-16;
}

.header-tools__icon--expand {
  @apply block flex-shrink-0 w-15;
}

.header-tools__icon--cog {
  @apply flex-shrink-0 w-21;
}

@screen md {
  .header-tools {
    @apply flex-col space-y-10 top-40 right-0 bg-black p-0 rounded flex-wrap mt-0;

  }

  .header-tools__item {
    @apply flex flex-wrap mt-0 w-full border-gray-300 md:border-b border-opacity-25 !important;
  }

  .header-tools__item:last-child {
    @apply border-none;
  }

  .header-tools__link {
    @apply p-16 m-0 w-full;
    cursor: pointer;
  }
}

@screen lg {
  .header-tools {
    /* @apply ml-32; */
  }
}

@screen xl {
  .header-tools {
    /* @apply ml-48; */
  }
}
.selectList {
  background-color: black;
  padding: 5px 10px;
  height: 57px;
  display: flex;
  align-items: center;
  color: white;
  width: 100%;
  cursor: pointer;
}

.selectList .item {
  flex: 1;
}

.green {
  color: green;
}
</style>
