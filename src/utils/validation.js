// Copyright (C) 2022 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { required as _required, helpers, minLength } from '@vuelidate/validators'

/**
 * CT amount validation rules.
 *
 * These rules do not automatically parse the raw value.
 * Parsing should be handled in the component, returning NaN if the raw value contains invalid characters.
 * To validate correctly against current balance, reactive properties must be provided, per:
 * https://vuelidate-next.netlify.app/custom_validators.html#passing-extra-reactive-properties
 *
 * An example of usage can be found in SendModal.vue.
 *
 * @param {number} b Balance (reactive)
 * @param {number} p Parsed amount (reactive)
 * @returns ValidationRuleWithParams[]
 */
export const amount = (b, p) => [
  helpers.withParams({ p }, helpers.withMessage('金额无效。', () => !isNaN(p) && p > 0)),
  helpers.withParams({ b, p }, helpers.withMessage('余额不足。', () => {
    if (isNaN(p)) return false
    return p <= (b)
  }))
]

/**
 * Create a validation function for case insensitive comparison, similar to Vuelidate's `sameAs` function.
 *
 * If a `msg` argument is provided, it will be set as the error message if the validation fails.
 *
 * @param {string} cmp Comparison string. Will be converted to lowercase automatically
 * @param {string} msg Optional message
 * @returns Function
 */
export const caseInsensitive = (cmp, msg = '') => {
  const lcmp = cmp.toLowerCase()
  const validate = val => val.toLowerCase() === lcmp
  if (msg.length) return helpers.withMessage(msg, validate)
  return validate
}


const ethAddressRegexp = /^0x[a-fA-F0-9]{40}$/
/**
 * Ethereum address validator.
 */
export const ethAddress = helpers.withMessage('无效的 草田链地址.', v => ethAddressRegexp.test(v))

/**
 * Password length validator.
 */
export const passwordLength = helpers.withMessage('必须为 8 个字符或更多。', minLength(8))

/**
 * Required password validator.
 */
export const passwordRequired = helpers.withMessage('Password required.', _required)

/**
 * Required value validator with a more attractive error message.
 */
export const required = helpers.withMessage('需要一个值。', _required)

const ctAddressRegexp = /^0x[a-fA-F0-9]{40}$/
/**
 * CT address validator.
 */
export const ctAddress = helpers.withMessage('Invalid CT address.', v => ctAddressRegexp.test(v))
