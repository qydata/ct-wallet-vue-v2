// Copyright (C) 2022 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

import {createStore} from 'vuex'
import {fetchTokenValue} from './utils/api'
import {empty, expire, getAddress, getUnlockExpiry, getWalletVersion, setUnlockExpiry} from './utils/storage'

const Web3 = require('web3')
const ethers = require('ethers')
const WALLET_EXPIRY = 5 * 60 * 1000

const init = async () => {
  const version = await getWalletVersion()

  const expires = await getUnlockExpiry()
  const locked = expires.getTime() < Date.now()

  const address = await (async () => {
    try {
      return await getAddress(version)
    } catch (err) {
      console.debug(err)
      return ''
    }
  })()

  return createStore({
    state: {
      locked,
      version,

      address,
      balance: 0,
      nextNonce: 0,

      usdBalance: undefined,

      // TODO investigate whether we can set these in app mixin instead
      config: {
        blockchain: {
          baseURL: process.env.VUE_APP_BLOCKCHAIN_API_URL
        },
        index: {
          baseURL: process.env.VUE_APP_INDEX_API_URL
        }
      }
    },
    mutations: {
      lock(state) {
        state.locked = true
        expire()
      },
      reset(state) {
        state.locked = true
        state.address = ''
        state.balance = 0
        state.nextNonce = 0
      },
      setAddress(state, address) {
        state.address = address
      },
      setBalance(state, balance) {
        state.balance = balance
      },
      setNextNonce(state, nextNonce) {
        state.nextNonce = nextNonce
      },
      setUSDBalance(state, usdBalance) {
        state.usdBalance = usdBalance
      },
      unlock(state) {
        state.locked = false
        setUnlockExpiry(new Date(Date.now() + WALLET_EXPIRY))
      }
    },
    actions: {
      async backgroundRefresh({commit, dispatch, state}, router) {
        const expires = await getUnlockExpiry()
        const locked = expires.getTime() < Date.now()

        if (locked) {
          if (!state.locked) {
            commit('lock')
            router.push('/')
          }
        }
        else {
          // postpones expiry
          commit('unlock')
          dispatch('refresh')
        }
      },
      forget({commit}) {
        empty()
        commit('reset')
      },
      async refresh({commit, dispatch, state}) {
        const web3 = new Web3(state.config.blockchain.baseURL)
        if (!state.address) return
        if (state.locked) return
        // const info = await xe.wallet.infoWithNextNonce(state.config.blockchain.baseURL, state.address)
        let balance = await web3.eth.getBalance(state.address)
        balance = ethers.utils.formatEther(balance)
        commit('setBalance', balance)

        const nonce = await web3.eth.getTransactionCount(state.address)
        commit('setNextNonce', nonce)
        dispatch('refreshTokenValue')
      },
      async refreshTokenValue({commit, state}) {
        const tokenValue = await fetchTokenValue()
        commit('setUSDBalance', tokenValue.usdPerXE * (state.balance / 1e6))
      }
    }
  })
}

export default {
  init
}
