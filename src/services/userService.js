// src/services/userService.js

import {fetchGraphQL} from './graphql'

export function chainpayOrderEvents(skip, first, hideReleased) {
  let query
  let variables
  if (hideReleased === 1) {
    query = `
    query (
    $skip:Int
    $first:Int
    $_chainpayOrder_state:BigInt
    ) {
      chainpayOrderEvents(
        orderBy: _chainpayOrder_createAt
        skip: $skip
        where: {_chainpayOrder_state: $_chainpayOrder_state}
        first: $first
        ) {
        id
        _chainpayOrder_sender
        _chainpayOrder_trues
        _chainpayOrder_falses
        _chainpayOrder_value
        blockNumber
        blockTimestamp
        transactionHash
        _chainpayOrder_state
        _chainpayOrder_orderId
        _chainpayOrder_createAt
        _chainpayOrder_updateAt
      }
    }
  `
    variables = {skip: skip, first: first, _chainpayOrder_state: hideReleased}
  }
  else {
    query = `
    query ($skip:Int, $first:Int) {
      chainpayOrderEvents(
        orderBy: _chainpayOrder_createAt
        skip: $skip
        first: $first) {
        id
        _chainpayOrder_sender
        _chainpayOrder_trues
        _chainpayOrder_falses
        _chainpayOrder_value
        blockNumber
        blockTimestamp
        transactionHash
        _chainpayOrder_state
        _chainpayOrder_orderId
        _chainpayOrder_createAt
        _chainpayOrder_updateAt
      }
    }
  `
    variables = {skip: skip, first: first}

  }
  return fetchGraphQL(query, variables)
}
