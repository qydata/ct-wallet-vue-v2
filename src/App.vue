<template>
  <div id="app" class="app">
    <router-view :key="$route.fullPath"/>
  </div>
</template>

<script>
const ethers = require('ethers')
export default {
  title() {
    return 'CT Wallet'
  },

  methods: {
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
  },
  mounted: function () {
    this.setViewHeight()
    window.addEventListener('resize', () => {
      this.setViewHeight()
    })
    this.blockEvemt()
  }
}
</script>

<style>
.app {
  @apply bg-gray-200 h-screen;
}
</style>
