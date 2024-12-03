<template>
  <div class="container-fluid p-1">
    <div class="d-flex justify-between">
      <h4 class="h4 mb-4">快速历史记录</h4>
      <div class="btn-group">
        <v-btn
          type="primary"
          v-ripple="'rgba(255, 255, 255, .2)'"
          class="btn btn-secondary dropdown-toggle w-40"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          style="max-height: 40px"
          @click="showFilterOpts = !showFilterOpts"
        >
          {{ filterOpts[selectedFilterOpt] }}
        </v-btn>
        <div
          class="dropdown-menu dropstart"
          :style="'display:' + (showFilterOpts ? 'block' : 'none') + ';'"
        >
          <a
            v-for="(name, value) of filterOpts"
            :key="`${value}-filter-option`"
            class="dropdown-item"
            href="#!"
            @click.prevent="filterBy(value)"
          >
            {{ name }}
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="requestHistory.length"
      class="w-100 list-group history-container"
    >
      <div
        v-for="request of requestHistory"
        :key="request.id"
        class="list-group-item"
      >
        <p
          class="capitalize mb-1"
          :class="[
            request.method === 'wallet_connect' ? 'eth-title' : '',
            request.method === 'wallet_beacon' ? 'xtz-title' : ''
          ]"
        >
          {{ formatMethod(request.method) }}
        </p>
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1 h5">
            {{ parseData(request.params).peerMeta.name }}
          </h5>
          <small>{{ formatRequestTimestamp(request.date) }}</small>
        </div>
        <p class="mb-1">Request ID: {{ parseData(request.params).id }}</p>
      </div>
    </div>
    <div v-else>没有要显示的历史记录。</div>
  </div>
</template>

<script>
import moment from 'moment'

const initState = () => ({
  showFilterOpts: false,
  filterOpts: {
    all: '所有',
    walletConnect: '钱包连接'
  },
  selectedFilterOpt: 'all'
})

export default {
  name: 'DappQuickHistory',
  data: initState,
  computed: {
    requestHistory() {
      const history = this.$store.state.web3Connections.history
      console.log(history)
      const filterBy = this.selectedFilterOpt
      const types = {
        walletConnect: 'wallet_connect'
      }

      const filtered = history.filter((log) => {
        if (filterBy === 'all') return log
        return types[filterBy] === log.method
      })

      return filtered
    }
  },
  methods: {
    formatMethod(method) {
      return method.replace(/_/g, ' ')
    },
    parseData(data) {
      return JSON.parse(data)
    },
    formatRequestTimestamp(date) {
      return moment(date).fromNow()
    },
    filterBy(type) {
      this.selectedFilterOpt = type
      this.showFilterOpts = false
    }
  }
}
</script>

<style scoped>
</style>
