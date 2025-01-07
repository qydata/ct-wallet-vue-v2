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
  if (publicKey !== undefined) return ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))
  return undefined
}

const getPrivateKey = async (password) => {
  const enc = await get('p2', store)
  if (enc === undefined) return undefined
  return decrypt(enc, resize(password))
}

const getPublicKey = () => get('p1', store)

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

const setPrivateKey = (key, password) => set('p2', encrypt(key, resize(password)), store)
const setPublicKey = key => set('p1', key, store)

export {
  comparePassword,
  getAddress,
  getPublicKey,
  getPrivateKey,
  hasWallet,
  setPublicKey,
  setPassword,
  setPrivateKey
}
