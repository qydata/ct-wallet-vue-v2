// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

const ethers = require('ethers')

const BLOCKCHAIN_API_URL = process.env.VUE_APP_BLOCKCHAIN_API_URL
const INDEX_API_URL = process.env.VUE_APP_INDEX_API_URL
const BASE_URL = process.env.VUE_APP_BASE_URL
const fetchBlocks = async (options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 10
  }

  return getBlockNoByTimestampList(options).then((resultBlock) =>
    // console.log('resultBlock', resultBlock)
    ({
      blocks: resultBlock.data.result
    })
  )
}

const fetchData = (url, options = {}, payload) => {
  const fetchOptions = {
    method: options.method || 'get',
    headers: {
      'content-type': 'application/json'
    }
  }

  if (payload) {
    fetchOptions.body = JSON.stringify(payload, true, 2)
  }

  return fetch(url, fetchOptions)
    .then(res => {
      // a non-200 response code
      if (!res.ok) {
        // create error instance with HTTP status text
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }

      return res.json()
    })
    .catch(() => ({
      results: [],
      metdata: {}
    }))
}

const fetchPendingTransactions = (address) => {
  const url = `${BLOCKCHAIN_API_URL}/transactions/pending/${address}`

  return fetchData(url)
}

const fetchGasRates = async () => fetchData(`${INDEX_API_URL}/gasrates`)

const fetchExchangeRates = async () => await fetchData(`${INDEX_API_URL}/exchangerate`)


const fetchSessionsStats = async (wallet, options = {}) => {
  if (!options.range) options.range = 'daily'
  if (!options.count) options.limit = 100
  if (!wallet) options.wallet = null
  const url = `${INDEX_API_URL}/nodes/activity/?range=${options.range}&count=${options.count}&wallet=${wallet}`

  const results = await fetchData(url)
  return results
}

function getTxList(addressHash, page, offset) {
  return fetchData(`${BASE_URL}/api/index.php?a=getTargetResponse`, {
    method: 'post'
  }, {
    target_url:
      `http://ctblock.cn/api?module=account&action=txlist&address=${addressHash}&page=${page}&offset=${offset}`
  })
}

function sendTelCode(data) {
  return fetchData(`${BASE_URL}/api/index.php?a=send_telcode`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function queryCert(data) {
  return fetchData(`${BASE_URL}/api/index.php?a=query_cert`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function putChangeReq(data) {
  return fetchData(`${BASE_URL}/api/index.php?a=putChangeReq`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function checkPay(data) {
  return fetchData(`${BASE_URL}/api/index.php?a=check_pay&order_id=` + data.order_id, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function userCert(data) {
  return fetchData(`${BASE_URL}/api/index.php?a=user_cert`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function getPendingTxList(addressHash, page, offset) {
  return fetchData(`${BASE_URL}/api/index.php?a=getTargetResponse`,
    {method: 'post'},
    {
      target_url:
        `http://ctblock.cn/api?module=account&action=pendingtxlist&address=${addressHash}&page=${page}&offset=${offset}`
    })
}

function getBlockNoByTimestampList(options) {
  return fetchData(`${BASE_URL}/api/index.php?a=getTargetResponse`,
    {method: 'post'},
    {
      target_url: `http://ctblock.cn/api?module=account&action=getminedblocks&address=0xcEBcbF16494EDbAd87d7FEAb0260ADe82c571E5D&page=${options.page}&offset=${options.limit}`
    })
}

const fetchTransactions = async (address, options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 20
  }

  let txResults = []
  return getPendingTxList(address, options.page, options.limit).then((resultPending) => {
    // console.log('getPendingTxList', resultPending)
    txResults = txResults.concat(formatTransactions(address, resultPending.data.result, true))
    // Fetch confirmed transactions.
    // console.log('txResults_getPendingTxList', txResults)
    return getTxList(address, options.page, options.limit).then((resultTx) => {
      // console.log('getTxList', resultTx)
      txResults = txResults.concat(formatTransactions(address, resultTx.data.result))
      // console.log('txResults_getTxList', txResults)
      return {
        transactions: txResults
      }
    })
  })
}

function getTokenList(addressHash) {
  return fetchData(`${BASE_URL}/api/index.php?a=getTargetResponse`,
    {method: 'post'},
    {
      target_url: `http://ctblock.cn/api?module=account&action=tokenlist&address=${addressHash}`
    })
}

const fetchDisplay = async (address, options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 20
  }

  // address = '0x39a1E670db3F586122150067F79937716Dd48230'

  return getTokenList(address).then((resultTokenList) =>
      // console.log('getPendingTxList', resultPending)
      // Fetch confirmed transactions.
      // eslint-disable-next-line brace-style
    {
      return {
        transactions: resultTokenList.data.result
      }
    }
  )
}

const formatTransactions = (address, data, pending) => {
  const transactions = []

  data.forEach(tx => {

    transactions.push({
      address: tx.from === address ? tx.to : tx.from,
      amount: tx.value,
      // '16/04/2021 13:06',
      date: tx.timeStamp,
      description: tx.input || 'None',
      hash: tx.hash,
      recipient: tx.to,
      sender: tx.from,
      timestamp: tx.timeStamp,
      type: tx.from === address ? 'Sent' : 'Received',
      confirmations: tx.confirmations,
      pending
    })
  })

  return transactions
}

const fetchTokenValue = async () => fetchData(`${INDEX_API_URL}/token/current`)

export {
  fetchBlocks,
  fetchPendingTransactions,
  fetchGasRates,
  fetchExchangeRates,
  fetchSessionsStats,
  fetchTransactions,
  fetchDisplay,
  sendTelCode,
  queryCert,
  userCert,
  putChangeReq,
  checkPay,
  formatTransactions,
  fetchTokenValue
}
