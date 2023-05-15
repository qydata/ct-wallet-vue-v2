// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

import Index from '../views/Index.vue'
import Nodes from '@/views/Nodes'
import Overview from '@/views/Overview'
import Staking from '@/views/Staking'
import ChatPanel from '@/views/ChatPanel'
import MintPanel from '@/views/MintPanel'
import Transactions from '@/views/Transactions'
import Display from '@/views/Display'
import { createRouter, createWebHistory } from 'vue-router'

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
    component: () => {},
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
