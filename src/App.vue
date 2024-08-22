<template>
  <div id="app" class="app">
    <router-view :key="$route.fullPath"/>
  </div>
</template>

<script>
const ethers = require('ethers')
import {useDark, useToggle} from '@vueuse/core'

export default {
  title() {
    return '草田链'
  },
  mounted: function () {
    useToggle(useDark())
    // 强制应用黑夜模式
    this.setDarkMode()
    this.setViewHeight()
    window.addEventListener('resize', () => {
      this.setViewHeight()
    })
    this.blockEvemt()
  },
  methods: {
    setDarkMode() {
      document.body.classList.add('dark-mode')
    },
    toggleTheme() {
      document.body.classList.toggle('dark-mode')
    },
    blockEvemt() {
      let customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      customHttpProvider.on('block', (blockNumberT) => {
        // console.log('blockNumberT:', blockNumberT)
        window.localStorage.setItem('blockNumber', blockNumberT)
        // EventBus.$emit('blockNumberT', blockNumberT)
      })
    },
    setViewHeight: function () {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
  }
}
</script>

<style>
.app {
  @apply bg-gray-200 h-screen;
}
</style>
