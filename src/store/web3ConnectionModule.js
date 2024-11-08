import Web3ConnectionService from '../service/Web3ConnectionService'
import WalletConnect from './walletConnect'

const dbConnection = new Web3ConnectionService()

const initState = () => ({
  walletConnect: {
    web3wallet: null,
    sessions: {}
  },
  history: []
})

export default {
  namespaced: true,
  state: initState,
  mutations: {
    setWalletConnect(state, web3wallet) {
      state.walletConnect.web3wallet = web3wallet
    },
    setWalletConnectSession(state, session) {
      const topic = session.topic || session.handshakeTopic
      // 假设 state.walletConnect.sessions 已经是一个响应式对象
      state.walletConnect.sessions[topic] = session
    },
    removeWalletConnectSession(state, topic) {
      delete state.walletConnect.sessions[topic]

    },

    setHistory(state, history) {
      state.history = history
    },
    addToHistory(state, instance) {
      state.history = [instance, ...state.history]
    }
  },
  actions: {
    // Wallet Connect Actions
    async handleWCSessionProposal(
      {commit, rootState},
      {approved, proposal, wallet}
    ) {
      const session = await WalletConnect.handleSessionProposal({
        approved,
        proposal,
        wallet: wallet
      })
      if (session) commit('setWalletConnectSession', session)
    },
    async handleWCSessionRequest(
      {rootGetters, dispatch},
      {approved, request, wallet}
    ) {

      // Get ToolWallet Wallet Object if request is approved

      await WalletConnect.handleSessionRequest({
        approved,
        request,
        wallet,
        dispatch
      })
    },
    async handleWCCallRequest(
      {rootGetters, rootState},
      {approved, request, wallet}
    ) {
      let network
      if (approved) {
        network = 'ctchain'
      }

      await WalletConnect.handleCallRequest({
        approved,
        request: {
          ...request,
          network
        },
        wallet: wallet
      })
    },

    async walletConnectInit({commit, state, dispatch}, {modal}) {
      // Return if Web3Wallet(V2) has already been initialized
      if (state.walletConnect.web3wallet) return

      // Create and store instance of Web3Wallet
      const web3wallet = await WalletConnect.initWeb3Wallet(
        modal,
        dispatch
      )
      commit('setWalletConnect', web3wallet)
      const sessions = web3wallet.getActiveSessions()
      // console.log('sessions', sessions)
      for (const session in sessions) {
        commit('setWalletConnectSession', sessions[session])
      }
      return web3wallet
    },

    async walletConnectPair({dispatch}, {uri, modal}) {
      await WalletConnect.initPairing({uri, modal, dispatch})
    },
    async walletConnectSessionDisconnect({commit, state}, {topic}) {
      // Handle v1 sessions
      try {
        await WalletConnect.sessionDisconnect(topic)
      } catch (err) {
        console.error(err)
      } finally {
        commit('removeWalletConnectSession', topic)
      }
    },
    // Below are actions associated with all Web3Connections
    async endAllSessions({state, dispatch}) {
      // update to end wallet connect sessions
      state = {...initState()}
    },
    async logRequest({rootState, commit}, request) {
      const userId = rootState.address
      const data = {
        ...request,
        date: new Date()
      }
      await dbConnection.addRequest(data, userId)
      commit('addToHistory', data)
    }
  }
}
