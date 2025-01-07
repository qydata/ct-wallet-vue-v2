<template>
  <v-container class="dapp_container">
    <Header/>
    <!--    <AccountPanel view="dapp"/>-->
    <v-row align="center" no-gutters>
      <v-col cols="auto">
        <v-btn size="x-small" @click="toHomePage" class="mx-2" :icon="HomeFilled"/>
      </v-col>
      <v-col md="7">
        <v-text-field
          :hide-details="true"
          v-model="inputAddr"
          type="text"

          single-line variant="tonal"
          clearable
          placeholder="请输入 dApp 地址"
        />
      </v-col>
      <v-col cols="3">
        <v-btn size="x-small" @click="isEnterLoad" class="mx-2" :icon="Position"/>
        <v-btn size="x-small" @click="isRefreshLoad" :icon="RefreshRight"/>
      </v-col>
    </v-row>
    <!-- 定义 iframe，指定 src 属性 -->
    <v-progress-linear v-if="isLoading" color="primary" indeterminate :height="5"></v-progress-linear>
    <iframe
      v-if="isIframeLoaded"
      ref="myIframe"
      @load="onIframeLoad"
      sandbox="allow-scripts allow-same-origin allow-forms"
      @error="onIframeError"
      scrolling="yes"
      :src="iframeSrc"
      style="width: 100%;overflow:hidden;"
      class=" h-screen"
      loading="lazy"
      allowfullscreen
    />
  </v-container>
</template>

<script>
import Header from '@/components/Header'
import {
  HomeFilled,
  Position,
  RefreshRight
} from '@element-plus/icons-vue'
import {mapState} from 'vuex'
import Web3Bridge from '../services/Web3Bridge'

export default {
  name: 'ViewDapp',
  data: function () {
    return {
      // 替换为你要嵌入的页面地址
      iframeSrc: 'https://test.ctblock.cn',
      // iframeSrc: 'http://127.0.0.1:4783',
      inputAddr: 'https://test.ctblock.cn',
      // inputAddr: 'http://127.0.0.1:4783',
      faviconUrl: '',
      isIframeLoaded: false,
      isLoading: true,
      interval: null
    }
  },
  components: {
    Header
  },
  computed: {
    ...mapState(['address']),
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    }
  },
  mounted() {
    let dappUrl = this.$route.query.dappUrl
    if (dappUrl) {
      this.iframeSrc = dappUrl
      this.inputAddr = dappUrl
    }

    this.isLoading = true
    // 绑定事件监听器，使用箭头函数捕获最新的 this
    window.addEventListener('keypress', (event) => this.isKeyPress(event))
    setTimeout(() => {
      this.isIframeLoaded = true
      // 延迟 1 秒加载
    }, 1000)
  },
  // 返回清理函数
  unmounted: function () {
    window.removeEventListener('keypress', this.isKeyPress)

  },
  methods: {
    getFavicon() {
      const iframe = this.$refs.myIframe
      try {
        // 尝试从 iframe 内部获取 favicon
        const favicon = iframe.contentWindow.document.querySelector('link[rel*="icon"]')
        if (favicon) {
          this.faviconUrl = favicon.href
        }
        else {
          // 如果没有找到 favicon，则使用默认路径
          const iframeSrc = new URL(iframe.src)
          this.faviconUrl = `${iframeSrc.origin}/favicon.ico`
        }
      } catch (error) {
        // 如果遇到跨域问题，则使用默认 favicon 路径
        console.error('Unable to access iframe content due to cross-origin restrictions.')
        const iframeSrc = new URL(iframe.src)
        this.faviconUrl = `${iframeSrc.origin}/favicon.ico`
      }
    },
    isEnterLoad() {
      this.iframeSrc = this.inputAddr
    },
    toHomePage() {
      this.iframeSrc = 'https://test.ctblock.cn'
      this.inputAddr = 'https://test.ctblock.cn'
    },
    isKeyPress(event) {

      if (event.charCode !== 13) return
      console.log(this.iframeSrc, this.inputAddr)
      this.iframeSrc = this.inputAddr
    },
    isRefreshLoad() {
      console.log('isRefreshLoad')
      this.isLoading = false
      // 通过添加随机数参数，强制刷新 iframe
      // 使用 URL 对象来处理参数，确保追加新的参数
      const url = new URL(this.iframeSrc)

      // 设置一个新的随机参数，例如 `timestamp`
      url.searchParams.set('timestamp', new Date().getTime())

      // 更新 iframeSrc 以触发重新加载
      this.iframeSrc = url.toString()
    },

    sendConfigAndStartInterval() {
      window.Web3Bridge.sendConfig(this.$refs.myIframe, this.address)
      this.interval = setInterval(() => {
        window.Web3Bridge.sendConfig(this.$refs.myIframe, this.address)
      }, 10)
      window.Web3Bridge.sendConfig(this.$refs.myIframe, this.address)
    },

    onIframeLoad() {
      console.log('onLoad!!!!!!!!!!!!')
      console.log('iframe 加载完成')
      this.isLoading = false
      if (!this.interval) {
        this.sendConfigAndStartInterval()
      }
      // It's loaded, we can stop pushing the config
      setTimeout(() => {
        clearInterval(this.interval)
        this.interval = null
      }, 2000)
      // this.getFavicon()

    },
    onIframeError() {
      console.log('iframe 加载错误')
      this.isLoading = false
    }
  },
  watch: {
    faviconUrl(newVal, oldVal) {
      // 当 iframeSrc 改变时，执行一些操作
      console.log(`faviconUrl changed from ${oldVal} to ${newVal}`)
    },
    iframeSrc(newVal, oldVal) {
      // 当 iframeSrc 改变时，执行一些操作
      this.isLoading = true
      console.log(`iframeSrc changed from ${oldVal} to ${newVal}`)
    }
  },

  setup() {
    return {
      HomeFilled, RefreshRight, Position
    }
  }
}
</script>

<style scoped>
.dapp_container {
  padding: 0px;
  height: fit-content;
  overflow: scroll;
}

/* 滚动条宽度 */
.dapp_container::-webkit-scrollbar {
  width: 1px; /* 垂直滚动条宽度 */
  height: 0px; /* 水平滚动条高度 */
}

</style>

