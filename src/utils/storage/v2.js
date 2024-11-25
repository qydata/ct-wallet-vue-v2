// Copyright (C) 2022 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import {get, getMany, set, setMany} from 'idb-keyval'
import {compare, createSalt, decrypt, encrypt, hash} from '../crypto'
import {store} from './'

const ethUtil = require('ethereumjs-util')
const comparePassword = async password => {
  const [hash, salt] = await getMany(['h', 's'], store)
  return compare(hash, salt, password)
}

const getAddress = async () => {
  const publicKey = await getPublicKey()
  if (publicKey !== undefined) {
    return ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))
  }
  else {
    return undefined
  }
}

const getPrivateKey = async (password) => {
  const enc = await get('p2', store)
  if (enc === undefined) return undefined
  return decrypt(enc, resize(password))
}


const getWalletList = async () => {
  let wallet_list = await get('wallet-list', store)
  if (wallet_list === undefined) {
    wallet_list = []
  }
  return wallet_list
}


const getPublicKey = () => get('p1', store)
const getWalletName = () => get('walletName', store)

const hasWallet = async () => {
  const encPublicKey = await get('p1', store)
  return encPublicKey !== undefined
}

/**
 * Resize password to 32 characters for cipher.
 *
 * @param {string} password Password to resize
 */
const resize = password => {
  if (password.length < 32) {
    return password.padEnd(32, '0')
  }
  else if (password.length > 32) {
    return password.slice(0, 32)
  }
  return password
}

const setPassword = password => {
  const s = createSalt()
  const h = hash(password, s)
  return setMany([
    ['s', s],
    ['h', h]
  ], store)
}

const setPrivateKey = (key, password) => {
  set('p2', encrypt(key, resize(password)), store)
}
const setPublicKey = key => set('p1', key, store)
const setWalletName = async (walletName, address) => {

  // 修改当前钱包
  set('walletName', walletName, store)

  if (address != undefined) {
    //修改列表数据
    let walletList = await get('wallet-list', store)
    walletList = JSON.parse(JSON.stringify(walletList))
    for (const walletListKey in walletList) {
      const walletItem = walletList[walletListKey]

      const publicKey = walletItem.p1
      const inAddress = ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))

      if (inAddress.toLowerCase() == address.toLowerCase()) {
        walletItem.walletName = walletName
      }
    }
    await set('wallet-list', walletList, store)
  }
}

const setWalletList = async () => {
  let wallet_list = await get('wallet-list', store)
  if (wallet_list === undefined) {
    wallet_list = []
  }

  let isHas = false
  let privateKeyP2
  let publicKeyP1
  let walletName
  privateKeyP2 = await get('p2', store)
  publicKeyP1 = await get('p1', store)
  walletName = await get('walletName', store)

  for (const walletListKey in wallet_list) {
    const walletItem = wallet_list[walletListKey]

    const publicKey = walletItem.p1

    if (publicKey.toLowerCase() == publicKeyP1.toLowerCase()) {
      isHas = true
      break
    }
  }

  if (isHas) {
    console.log('钱包已存在.')
  }
  else {

    wallet_list.push({
      'p1': publicKeyP1,
      'p2': privateKeyP2,
      'walletName': walletName
    })
    set('wallet-list', wallet_list, store)
  }
}


const switchWallet = (publicKeyP1, privateKeyP2, walletName) => {
  setMany([
    ['p1', publicKeyP1],
    ['p2', privateKeyP2],
    ['walletName', walletName]
  ], store)
}


export {
  comparePassword,
  getAddress,
  getPublicKey,
  getPrivateKey,
  hasWallet,
  setPublicKey,
  setPassword,
  setPrivateKey,
  getWalletList,
  setWalletList,
  getWalletName,
  setWalletName,
  switchWallet
}
