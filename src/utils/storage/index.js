// Copyright (C) 2022 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import {clear, createStore, del, get, set} from 'idb-keyval'
import * as v0 from './v0'
import * as v1 from './v1'
import * as v2 from './v2'
import {setWalletList} from './v2'

const KEY_UNLOCK_EXPIRY = 'unlock-expiry'
const KEY_WALLET_VERSION = 'wallet-version'

const invalidVersion = version => new Error(`Invalid storage version ${version}`)

/**
 * All data is stored in a single edge database > wallet store.
 * `idb-keyval` does not support multiple stores:
 * https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md#defining-a-custom-database--store-name
 */
const store = createStore('ctchain', 'wallet')

/**
 * Compare password input to hashed password in storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {string} password Password input
 * @param {number|undefined} version Storage version
 * @returns Promise<boolean>
 */
const comparePassword = (password, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 0:
    return v0.comparePassword(password)
  case 1:
    return v1.comparePassword(password)
  case 2:
    return v2.comparePassword(password)
  default:
    throw invalidVersion(version)
  }
}

/**
 * Clear storage.
 *
 * @returns Promise<void>
 */
const empty = () => clear(store)

/**
 * Force unlock expiry.
 *
 * @returns Promise<void>
 */
const expire = () => del(KEY_UNLOCK_EXPIRY, store)

/**
 * Get wallet address from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */
const getAddress = (version = getHighestWalletVersion()) => {
  const versions = [v0, v1, v2]
  const selectedVersion = versions[version]

  if (!selectedVersion) {
    throw invalidVersion(version)
  }

  return selectedVersion.getAddress()
}

const getWalletName = version => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 2:
    return v2.getWalletName()
  default:
    throw invalidVersion(version)
  }
}

const setWalletName = (walletName, address, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 2:
    return v2.setWalletName(walletName, address)
  default:
    throw invalidVersion(version)
  }
}

/**
 * Get highest wallet version.
 *
 * @returns number
 */
// const getHighestWalletVersion = () => 1
const getHighestWalletVersion = () => 2

/**
 * Get wallet private key from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */
const getPrivateKey = (password, version = getHighestWalletVersion()) => {
  const versionHandlers = {
    0: () => v0.getPrivateKey(),
    1: () => v1.getPrivateKey(password),
    2: () => v2.getPrivateKey(password)
  }

  const handler = versionHandlers[version]
  if (!handler) {
    throw invalidVersion(version)
  }

  return handler()
}

/**
 * Get wallet public key from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */
const getPublicKey = (version = getHighestWalletVersion()) => {
  const versionHandlers = [v0, v1, v2]

  const handler = versionHandlers[version]
  if (!handler) {
    throw invalidVersion(version)
  }

  return handler.getPublicKey()
}

const getWalletList = version => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 2:
    return v2.getWalletList()
  default:
    throw invalidVersion(version)
  }
}

/**
 * Get unlock expiry time from storage.
 *
 * @returns Promise<Date>
 */
const getUnlockExpiry = async () => {
  const dateStr = await get(KEY_UNLOCK_EXPIRY, store)
  if (!dateStr) return new Date(0)
  return new Date(dateStr)
}

/**
 * Get wallet version from storage.
 *
 * If no version is found, this function returns 0.
 *
 * @returns Promise<number>
 */
const getWalletVersion = async () => {
  const v = await get(KEY_WALLET_VERSION, store)
  if (v !== undefined) return v
  return 2
}

/**
 * Set unlock expiry time in storage.
 *
 * @param {Date} date Expiry date & time
 * @returns Promise<void>
 */
const setUnlockExpiry = (date) => set(KEY_UNLOCK_EXPIRY, date.toString(), store)

const setCardList = (_address, date) => set('cardList' + _address.toLowerCase(), date, store)
const getCardList = async (_address) => get('cardList' + _address.toLowerCase(), store)

/**
 * Save wallet in storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {{ privateKey: string, publicKey: string }} keypair Wallet key pair
 * @param {string} password Password with which to encrypt wallet data
 * @param {number|undefined} version Storage version
 * @returns Promise<void>
 */
const setWallet = async (keypair, walletName, password, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 0:
    await v0.setPrivateKey(keypair.privateKey)
    await v0.setPublicKey(keypair.publicKey)
    await v0.setPassword(password)
    await setWalletVersion(0)
    break
  case 1:
    await v1.setPrivateKey(keypair.privateKey, password)
    await v1.setPublicKey(keypair.publicKey)
    await v1.setPassword(password)
    await setWalletVersion(1)
    break
  case 2:
    await v2.setPrivateKey(keypair.privateKey, password)
    await v2.setPublicKey(keypair.publicKey)
    await v2.setWalletName(walletName)
    await v2.setPassword(password)
    await setWalletVersion(2)
    await setWalletList()
    break
  default:
    throw invalidVersion(version)
  }
}

const switchWallet = async (publicKeyP1, privateKeyP2, walletName, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 2:
    await v2.switchWallet(publicKeyP1, privateKeyP2, walletName)
    break
  default:
    throw invalidVersion(version)
  }
}

/**
 * Set wallet version in storage.
 *
 * @param {number} v Wallet version
 * @returns Promise<void>
 */
const setWalletVersion = v => set(KEY_WALLET_VERSION, v, store)

export {
  comparePassword,
  empty,
  expire,
  getAddress,
  getHighestWalletVersion,
  getPrivateKey,
  getPublicKey,
  getUnlockExpiry,
  getWalletVersion,
  setUnlockExpiry,
  setCardList,
  getCardList,
  setWallet,
  setWalletVersion,
  getWalletList,
  switchWallet,
  getWalletName,
  setWalletName,
  store
}
