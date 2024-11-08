<template>
  <div class="text-blue-50">
    <div v-if="views.includes(view)">
      <div v-if="warning" class="alert alert-warning">
        {{ warning }}
      </div>
      <div
        v-for="param in paramsFormatted"
        :key="'param-list-item-' + param.label"
        class="py-5"
      >
        <div class="grid grid-cols-1 gap-4">

          <el-text tag="b" size="large">{{ param.label }}</el-text>
          <el-text line-clamp="5">
            {{ param.value }}
          </el-text>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="h6 warining">ToolWallet 无法执行请求的操作。</p>
    </div>
  </div>
</template>

<script>
import {utils, providers} from 'ethers'
import walletConnect from '../../store/walletConnect'
import {ctchain} from '../../utils/cryptos/blockchainApi/infura'

const {
  transactionRequests,
  typedRequests,
  signMessageRequests,
  sessionRequest,
  sessionProposal,
  otherRequests
} = walletConnect.requestTypes

const initState = () => ({
  views: [
    ...transactionRequests,
    ...typedRequests,
    ...signMessageRequests,
    ...otherRequests,
    sessionRequest,
    sessionProposal
  ]
})

export default {
  name: 'WalletConnectRequestDetails',
  props: {
    request: {
      type: Object,
      required: true
    },
    connector: {
      type: Object,
      required: false
    }
  },
  data: initState,
  computed: {
    view() {
      return this.request.method
    },
    method() {
      const isSessionProposal = this.request.method === sessionProposal
      if (isSessionProposal) {
        return this.request.method
      }
      return this.params.request.method
    },
    params() {
      return this.request.params
    },
    paramsFormatted() {
      const params = this.params

      if (this.view === sessionRequest) {
        const params = this.params.request.params
        const formatted = this.formatSessionRequest(this.method, params)
        return formatted
      }
      else if (this.view === sessionProposal) {
        const peer = params.proposer.metadata

        // Format Namespaces
        // const namespaces = params.requiredNamespaces.eip155
        const namespaces = params.optionalNamespaces.eip155
        const chains = namespaces.chains.map((chain) => {
          const [, chainId] = chain.split(':')
          let network
          if (chainId === '27') {
            network = ctchain
          }
          else {
            network = providers.getNetwork(parseInt(chainId))
          }
          return network.name
        })

        const formatted = [
          this.format('名称:', peer.name),
          this.format('描述:', peer.description),
          this.format('请求的链:', chains),
          this.format('方法:', namespaces.methods),
          this.format('事件:', namespaces.events)
        ]

        return formatted
      }
      else {
        return this.formatSessionRequest(this.method, this.params)
      }
      return []
    },
    requestedNetwork() {
      let chainName

      // Wallet Connect v2 Requests
      if (this.method !== sessionProposal) {
        const [, chainId] = this.params.chainId.split(':')
        let chain
        if (chainId == '27') {
          chain = ctchain
        }
        else {
          chain.getNetwork(parseInt(chainId))
        }
        chainName = chain.name
      }

      this.$emit('getRequestedWalletConnectNetwork', chainName)
      return chainName
    },
    userNetwork() {
      return 27
    },
    warning() {
      if (!this.requestedNetwork) return ''
      if (this.userNetwork !== this.requestedNetwork) {
        return `ToolWallet 目前已配置到以太坊网络 ${this.userNetwork}。dApp 请求在 ${this.requestedNetwork} 网络上执行此操作。如果获得批准，ToolWallet 将自动切换到 ${this.requestedNetwork}。`
      }
      else if (this.method === 'wallet_switchEthereumChain') {
        return `此 dApp 请求将 ToolWallet 配置的以太坊网络切换到 ${this.requestedNetwork}。`
      }
      return ''
    }
  },
  methods: {
    format(label, value) {
      return {label, value} // return object with label/value keys
    },
    formatSessionRequest(method, params) {
      if (transactionRequests.includes(method)) {
        const tx = params[0]
        const formatted = []

        formatted.push(this.format('From', tx.from))
        if (tx.to) formatted.push(this.format('To', tx.to))
        if (tx.gasLimit)
          formatted.push(this.format('Gas Limit', parseInt(tx.gasLimit)))
        if (tx.gas) formatted.push(this.format('Gas', parseInt(tx.gas)))
        if (tx.gasPrice)
          formatted.push(this.format('Gas Price', parseInt(tx.gasPrice)))
        if (tx.nonce) formatted.push(this.format('Nonce', parseInt(tx.nonce)))
        if (tx.value) formatted.push(this.format('Value', parseInt(tx.value)))
        formatted.push(this.format('Data', tx.data))

        // Return formatted transaction request
        return formatted
      }
      else if (typedRequests.includes(method)) {
        // Return formatted typed request
        return [
          this.format('Address', params[0]),
          this.format('Data', JSON.stringify(params[1]))
        ]
      }
      else if (signMessageRequests.includes(method)) {
        const decode = (message) => {
          const messageArray = utils.arrayify(message)
          const messageText = Buffer.from(messageArray).toString()
          return messageText
        }
        // Return formatted typed request
        const [address, message] =
          method === 'personal_sign' ? [params[1], decode(params[0])] : params
        return [
          this.format('Address', address),
          this.format('Message', message)
        ]
      }
      else if (otherRequests.includes(method)) {
        // Format params for all other requests
        const formatted = []
        formatted.push(this.format('Method: ', method))

        if (method === 'wallet_switchEthereumChain') {
          const chainId = parseInt(this.params[0].chainId)
          const chainName = providers.getNetwork(chainId).name
          const chainNameFormatted = this.format('Chain: ', chainName)
          formatted.push(chainNameFormatted)
        }
        else {
          const paramsObjFormatted = this.format(
            'Params: ',
            JSON.stringify(this.params)
          )
          formatted.push(paramsObjFormatted)
        }
        console.log({formatted})

        return formatted
      }
    }
  }
}
</script>

<style scoped>
.param-value-container {
  max-height: 8rem;
  overflow: auto;
}
</style>
