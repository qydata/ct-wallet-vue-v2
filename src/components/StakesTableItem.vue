<template>
  <tr>
    <td data-title="ID:" :title="item.id">
      <a :href="explorerStakeUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.id }}
        </span>
      </a>
    </td>

    <td data-title="Hash:" :title="item.hash">
      <span class="monospace lg:inline-block">
        {{ item.hash }}
      </span>
    </td>

    <td data-title="Node:" :title="item.device">
      <span v-if="item.type === 'governance'" class="text-gray-400 lg:inline-block">N/A</span>
      <a v-else-if="item.device" :href="explorerNodeUrl">
        <span class="monospace lg:inline-block">
          {{ item.device }}
        </span>
      </a>
      <span v-else class="text-gray-400 lg:inline-block">None</span>
    </td>

    <td data-title="Type:">
      <span class="lg:inline-block"><span class="monospace lg:font-sans">{{ formattedType }}</span></span>
    </td>

    <td data-title="Status:">
      <span v-if="item.released" class="lg:inline-block">
        <span class="mr-1 -mt-2 icon icon-grey"><ArrowCircleDownIcon/></span>
        <span class="monospace lg:font-sans">Released</span>
      </span>
      <span v-else-if="item.unlockRequested">
        <span v-if="isUnlocking" class="lg:inline-block">
          <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon/></span>
          <span class="monospace lg:font-sans">Unlocking</span>
        </span>
        <span v-else class="lg:inline-block">
          <span class="mr-1 -mt-2 icon icon-grey"><DotsCircleHorizontalIcon/></span>
          <span class="monospace lg:font-sans">Unlocked</span>
        </span>
      </span>
      <span v-else class="lg:inline-block">
        <span class="mr-1 -mt-2 icon icon-green"><CheckCircleIcon/></span>
        <span class="monospace lg:font-sans">Active</span>
      </span>
    </td>

    <td data-title="Amount (CT):" class="amount-col" :title="formattedAmount">
      <span class="monospace lg:inline-block">{{ formattedAmount }}</span>
    </td>

    <td data-title="">
      <button
        v-if="action"
        class="w-full table-button button--outline"
        @click="openModal"
      >
        {{ action }}
      </button>
    </td>
  </tr>
</template>

<script>
/*global process*/
import {ArrowCircleDownIcon, CheckCircleIcon, ClockIcon, DotsCircleHorizontalIcon} from '@heroicons/vue/outline'

const ethers = require('ethers')
export default {
  name: 'StakesTableItem',
  props: ['item', 'openReleaseStakeModal', 'openUnlockStakeModal'],
  components: {
    ArrowCircleDownIcon,
    CheckCircleIcon,
    ClockIcon,
    DotsCircleHorizontalIcon
  },
  computed: {
    action() {
      if (this.item.released) return null
      else if (this.item.unlockRequested) return 'Release'
      else return 'Unlock'
    },
    address () {
      return this.item.tx.recipient
    },
    explorerNodeUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/node/${this.item.device}`
    },
    explorerStakeUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/stake/${this.item.id}`
    },
    explorerWalletUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.address}`
    },
    formattedAmount() {
      return ethers.utils.formatEther(this.item.amount)
    },
    formattedType() {
      return this.item.type.charAt(0).toUpperCase() + this.item.type.slice(1)
    },
    isUnlocking() {
      return this.item.unlockRequested + this.item.unlockPeriod > Date.now()
    }
  },
  methods: {
    openModal() {
      if (this.action === 'Unlock') return this.openUnlockStakeModal(this.item)
      else if ( this.action === 'Release') return this.openReleaseStakeModal(this.item)
    }
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full pb-4 leading-tight;
}

td span {
  @apply w-full overflow-ellipsis overflow-hidden whitespace-nowrap
}

td a {
  @apply overflow-ellipsis overflow-hidden whitespace-nowrap
}

td::before {
  content: attr(data-title);
  @apply font-normal mr-8 min-w-100 text-xs text-gray-600 pt-2;
}

td:first-child {
  @apply rounded-l-4 pt-8;
}

td:last-child {
  @apply rounded-r-4 pb-8 border-b-4 border-gray-200;
}

td .icon {
  @apply w-15 inline-block align-middle;
}

td .icon-green {
  @apply text-green;
}

td .icon-grey {
  @apply text-gray-400;
}

td a {
  @apply border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

button.table-button {
  @apply py-2 rounded text-black border-solid border border-gray-400 text-gray-500 hover:border-green hover:text-green
}

@screen lg {
  td {
    @apply border-gray-200 pt-13 pb-10 table-cell border-b-2 align-middle;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td.amount-col {
    @apply text-right
  }

  td:last-child {
    @apply pb-10 border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>

