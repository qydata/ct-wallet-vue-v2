// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

import CaptchaTestPanel from '@/views/CaptchaTestPanel'
import ChatPanel from '@/views/ChatPanel'
import Display from '@/views/Display'
import Interact from '@/views/interact'
import ConnectWallet from '@/views/ConnectWallet'
import InterSign from '@/views/InterSign'
import MintPanel from '@/views/MintPanel'
import Nodes from '@/views/Nodes'
import Overview from '@/views/Overview'
import Staking from '@/views/Staking'
import Transactions from '@/views/Transactions'
import {createRouter, createWebHistory} from 'vue-router'
import Index from '../views/Index.vue'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/nodes',
    name: 'Nodes',
    component: Nodes
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/transactions/:page(\\d+)?',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/display',
    name: 'Display',
    component: Display
  },
  {
    path: '/governance',
    name: 'Governance',
    component: () => {
    },
    disabled: true
  },
  {
    path: '/staking',
    name: 'Staking',
    component: Staking
  },
  {
    path: '/chatPanel',
    name: 'ChatPanel',
    component: ChatPanel
  },
  {
    path: '/mintPanel',
    name: 'MintPanel',
    component: MintPanel
  },
  {
    path: '/captchaTestPanel',
    name: 'CaptchaTestPanel',
    component: CaptchaTestPanel
  },
  {
    path: '/interact',
    name: 'Interact',
    component: Interact
  },
  {
    path: '/connectWallet',
    name: 'ConnectWallet',
    component: ConnectWallet
  },
  {
    path: '/interSign',
    name: 'InterSign',
    component: InterSign
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
