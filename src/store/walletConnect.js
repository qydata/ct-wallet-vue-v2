// Wallet Connect V2
import {Core} from '@walletconnect/core'
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils'
import {BigNumber, providers, utils} from 'ethers'
import {EventEmitter} from 'events'
import {EthEvent, WC_CONFIG as walletConnectConfig} from '../services/config/common'
import {EIP155_CHAINS, EIP155Method} from '../services/config/EIP155'
import infura, {ctchain} from '../utils/cryptos/blockchainApi/infura'
import eth from '../utils/cryptos/eth'

const ethers = require('ethers')

const walletConnectProjectID = walletConnectConfig.projectId
const sessionRequest = 'session_request'
// Core for V2
const walletConnectCore = new Core({
  projectId: walletConnectProjectID
})

class WalletConnect extends EventEmitter {
  constructor() {
    super()
    this.web3wallet = null // V2
    this.dispatch = null
    this.requestTypes = {
      transactionRequests: ['eth_sendTransaction', 'eth_signTransaction'],
      typedRequests: ['eth_signTypedData'],
      signMessageRequests: ['eth_sign', 'personal_sign'],
      sessionRequest: 'session_request',
      sessionProposal: 'session_proposal',
      otherRequests: ['wallet_switchEthereumChain']
    }
  }

  // Start a new pairing/connection
  initPairing({uri, modal, dispatch}) {
    // Get WalletConnect version to determine how pairing should be handled
    const version = this.getVersion(uri)
    if (version === '2') {
      this.pairWeb3Wallet(uri)
    }
    else {
      throw new Error('ToolWallet 尚不支持此 Wallet Connect 版本')
    }
  }

  getVersion(uri) {
    const versionIndex = uri.indexOf('@') + 1
    const version = uri[versionIndex]
    console.log('WC Version Received From URI: ', version)
    return version
  }

  pairWeb3Wallet(uri) {
    this.web3wallet.core.pairing.pair({uri})
  }

  _getAccounts(chains, address) {
    return Object.keys(chains).map((prefix) => `${prefix}:${address}`)
  }

  // Approve or Reject Web3Wallet Session
  async handleSessionProposal({approved, proposal, wallet}) {
    const {id, params} = proposal

    // Reject Session
    if (!approved) {
      const session = await this.web3wallet.rejectSession({
        id, reason: getSdkError('USER_REJECTED_METHODS')
      })
      return session
    }

    // Build EIP-155 Accounts ("eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb")
    // const accounts = []
    // params.requiredNamespaces.eip155.chains.forEach((chain) => {
    //   const eip155AccountString = chain + ':' + wallet
    //   accounts.push(eip155AccountString)
    // })

    // Build Approved Namespaces Object
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: params, supportedNamespaces: {
        eip155: {
          chains: Object.keys(EIP155_CHAINS),
          methods: Object.values(EIP155Method),
          events: [EthEvent.AccountsChanged, EthEvent.ChainChanged],
          accounts: this._getAccounts(EIP155_CHAINS, wallet)
        }
      }
    })

    // Approve Session
    const session = await this.web3wallet.approveSession({
      id, namespaces: approvedNamespaces
    })

    return session
  }

  async sessionDisconnect(topic) {
    await this.web3wallet.disconnectSession({
      topic, reason: getSdkError('USER_DISCONNECTED')
    })
  }

  async handleCallRequest({approved, method, params, wallet}) {
    // Handle Wallet Connect V1 Call Requests
    if (!approved) {
      // Reject request if not approved
      return await params.onReject()
    }

    // Process request
    const result = await ethMethods[method]({
      dispatch: this.dispatch, params, wallet
    })
    await params.onAccept(result)
  }

  async handleSessionRequest({approved, dispatch, request, wallet}) {
    let response

    if (!approved) {
      // If not approved create Error response
      response = {
        id: request.id, jsonrpc: '2.0', error: {
          code: 5000, message: 'User rejected.'
        }
      }
    }
    else {
      // Process request and create response
      const method = request.params.request.method
      const params = request.params.request.params
      const [, chainId] = request.params.chainId.split(':')
      let network
      if (chainId == '27') {
        network = ctchain
      }
      else {
        network = providers.getNetwork(parseInt(chainId))
      }

      const result = await ethMethods[method]({
        wallet, params, network: network.name, dispatch
      })
      response = {
        id: request.id, jsonrpc: '2.0', result
      }
    }

    const topic = request.topic
    return this.web3wallet.respondSessionRequest({topic, response})
  }

  getAddressFromRequestParams(method, params) {
    const requestTypes = this.requestTypes

    // Determine where address is listed in params based on request method
    if (requestTypes.transactionRequests.includes(method)) {
      const address = params[0].from
      return address
    }
    else if (requestTypes.typedRequests.includes(method)) {
      const address = params[0]
      return address
    }
    else if (requestTypes.signMessageRequests.includes(method)) {
      const address = method === 'personal_sign' ? params[1] : params[0]
      return address
    }
  }

  async buildTxDetails(tx) {
    if (!tx.gasPrice) tx.gasPrice = this.gasPrices.average
    if (!tx.nonce) tx.nonce = await eth.getNonce({
      address: tx.from, network: this.ethNetwork
    })
    if (!tx.chainId) tx.chainId = eth.getChainId(this.ethNetwork)
    return tx
  }
}

const ethMethods = {
  async eth_sendTransaction({wallet, params}) {
    // Create transaction object with valid ethers parameters
    const tx = await parseTxFromParams(params.transaction)

    // Create signer instance & sign transaction
    const privateKey = wallet.privateKey
    const signer = infura.getSigner({privateKey})
    console.log('tx:', tx)
    // Push transaction to blockchain
    const receipt = await signer.sendTransaction(tx)
    console.log('receipt:', receipt)
    return receipt.hash
  },
  async eth_signTransaction({wallet, params}) {
    const tx = await parseTxFromParams(params)
    const privateKey = wallet.privateKey
    const signedTx = await signTx({privateKey, tx})
    return signedTx
  }, async eth_signTypedData({wallet, params, network}) {
    // Extract data from params
    const typedData = JSON.parse(params[1])
    const {types, domain, message} = typedData

    // create signer
    const privateKey = wallet.privateKey
    const signer = infura.getSigner({privateKey, network})

    // Sign and return typed data
    const signed = await signer._signTypedData(domain, types, message)
    return signed
  }, async eth_sign({wallet, params, network}) {
    const privateKey = wallet.privateKey
    // extract message from params
    const message = params[1]
    const hexStringArray = utils.arrayify(message)
    // sign and return
    const signer = infura.getSigner({privateKey, network})
    const signed = await signer.signMessage(hexStringArray)
    return signed
  }, async personal_sign({wallet, params}) {
    const privateKey = wallet.privateKey
    // extract message from params
    const message = ethers.utils.toUtf8Bytes(params.message)
    const hexStringArray = ethers.utils.arrayify(message)
    // sign and return
    const signer = infura.getSigner({privateKey})
    const signed = await signer.signMessage(hexStringArray)
    return signed
  }, async wallet_switchEthereumChain({dispatch, params}) {
    const chainId = parseInt(params[0].chainId)
    let chain
    if (chainId == '27') {
      chain = ctchain
    }
    else {
      chain.getNetwork(parseInt(chainId))
    }
    await dispatch('userSettings/updateNetworkSelection', {coinTicker: 'eth', network: chain.name}, {root: true})
    return null
  }
}

async function parseTxFromParams(params) {
  // Create an object copy of transaction
  const tx = {
    from: params.from,
    to: params.to,
    data: params.data
  }
  console.log('tx.nonce:', tx.nonce)
  if (tx.gas) {
    tx.gasLimit = BigNumber.from(tx.gas)
    delete tx.gas
  }
  // if (tx.value) {
  //   tx.value = BigNumber.from(tx.value)
  // }
  // else {
  //   tx.value = 0
  // }
  // if (tx.gasPrice) tx.gasPrice = BigNumber.from(tx.gasPrice)
  tx.gasPrice = '4800000000000'
  if (tx.value) tx.value = BigNumber.from(tx.value)

  return tx
}

async function signTx({privateKey, tx, signer}) {
  const wallet = !signer ? infura.getSigner({privateKey}) : signer
  const signedTransaction = await wallet.signTransaction(tx)
  return signedTransaction
}

export const WCEvent = Object.freeze({
  sessionChanged: 'session_changed',
  pairingApproved: 'pairing_approved',
  pairingRejected: 'pairing_rejected',
  EthSendTransaction: EIP155Method.EthSendTransaction,
  RequestAccount: EIP155Method.RequestAccount,
  PersonalSign: EIP155Method.PersonalSign,
  MethodNotSupported: 'method_not_supported'
})

export default new WalletConnect()
