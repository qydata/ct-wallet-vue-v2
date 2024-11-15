<template>
  <div>
    <Header/>
    <!--    <AccountPanel view="dapp"/>-->
    <div class="bg-gray-200 dapp-div1" style="background-color: #1d1d1d">

      <div class="w-full grid grid-cols-12 gap-8 mb-10">
        <div class="col-span-1 content-center text-right">
          <el-button @click="toHomePage"
                     type="default"
                     class="bg-transparent border-none"
                     circle>
            <el-icon color="#ffffff" size="24">
              <HomeFilled/>
            </el-icon>
          </el-button>
        </div>
        <el-input
          v-model="inputAddr"
          type="text"
          size="default"
          class="col-span-8 md:col-span-9"
          placeholder="请输入 dApp 地址"
        >
          <template #prepend>
            <el-avatar
              v-if="faviconUrl"
              :src="faviconUrl"
              size="small"
              class="mr-5 bg-transparent w-fit"
            >
              faviconUrl
            </el-avatar>
            {{ urlPrefix }}
          </template>
        </el-input>

        <div class="col-span-3 md:col-span-2 content-center">
          <el-button @click="isEnterLoad"
                     type="default"
                     class="bg-transparent border-none"
                     circle>
            <el-icon color="#ffffff" size="24">
              <Position/>
            </el-icon>
          </el-button>

          <el-button @click="isRefreshLoad"
                     type="default"
                     class="bg-transparent border-none"
                     circle>
            <el-icon color="#ffffff" size="24">
              <RefreshRight/>
            </el-icon>
          </el-button>
        </div>
      </div>
      <!-- 定义 iframe，指定 src 属性 -->
      <div v-loading="isLoading">
        <iframe
          ref="myIframe"
          @load="onIframeLoad"
          @error="onIframeError"
          :src="iframeSrc"
          width="100vw"
          class="full-screen-iframe"
          height="100vh"
          loading="lazy"
          allowfullscreen
        />
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import {
  RefreshRight,
  HomeFilled,
  Position
} from '@element-plus/icons-vue'

export default {
  name: 'ViewDapp',
  data: function () {
    return {
      // 替换为你要嵌入的页面地址
      iframeSrc: 'https://test.ctblock.cn',
      inputAddr: 'test.ctblock.cn',
      faviconUrl: '',
      urlPrefix: 'https://',
      isLoading: false
    }
  },
  components: {
    Header,
    RefreshRight,
    HomeFilled,
    Position
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    }
  },
  mounted() {
    this.isLoading = true
    // 绑定事件监听器，使用箭头函数捕获最新的 this
    window.addEventListener('keypress', (event) => this.isKeyPress(event))
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
      this.iframeSrc = this.urlPrefix + this.inputAddr
    },
    toHomePage() {
      this.iframeSrc = 'https://test.ctblock.cn'
      this.inputAddr = 'test.ctblock.cn'
    },
    isKeyPress(event) {

      if (event.charCode !== 13) return
      console.log(this.iframeSrc, this.inputAddr)
      this.iframeSrc = this.urlPrefix + this.inputAddr
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
    onIframeLoad() {
      console.log('iframe 加载完成')
      this.isLoading = false
      this.getFavicon()

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
  }
}
</script>

<style scoped>

.checkbox-container label {
  @apply cursor-pointer mr-5 mb-0;
}

.checkbox-container input {
  opacity: 0;
  height: 0;
  width: 0;
}

/* Create custom checkbox */

/* On mouse-over, add grey background color */
.checkbox-container:hover input ~ .checkmark {
  border-color: rgb(70, 70, 70);
}

/* When checkbox is checked, add green background */
.checkbox-container input:checked ~ .checkmark {
  background-color: rgb(14, 204, 95);
  border: none;
}


/* Show checkmark when checked */
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style for checkmark */
.checkbox-container .checkmark:after {
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

/* 确保 iframe 父元素及根容器无多余边距 */
.full-screen-iframe {
  margin: 0;
  padding: 0;
  height: 90vh;
  width: 100vw;
  overflow: hidden;
}

.dapp-div1 {
  padding-top: 1vh;
}
</style>

