<template>
  <div>
    <Header/>
    <!--    <AccountPanel view="dapp"/>-->
    <div class="bg-gray-200 dapp-div1">

      <div class="px-20">
        <div class="grid grid-cols-12  checkbox-container gap-4">
          <el-input
            style="height: 32px; overflow: hidden"
            v-model="inputAddr"
            type="text"
            placeholder="请输入 dApp 地址"
          />

          <el-button @click="isEnterLoad" type="primary">载入</el-button>
          <el-button @click="isRefreshLoad" type="warning">刷新</el-button>
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
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'

export default {
  name: 'ViewDapp',
  data: function () {
    return {
      // 替换为你要嵌入的页面地址
      iframeSrc: 'https://test.ctblock.cn',
      inputAddr: 'https://test.ctblock.cn',
      isLoading: false
    }
  },
  components: {
    Header
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    }
  },
  mounted() {
    this.isLoading = true
    // 绑定事件监听器，使用箭头函数捕获最新的 this
    window.addEventListener('keypress', (event) => this.isKeyPress(event));
  },
  // 返回清理函数
  unmounted: function () {
    window.removeEventListener('keypress', this.isKeyPress)

  },
  methods: {
    isEnterLoad() {
      this.isLoading = true
      this.iframeSrc = this.inputAddr
    },
    isKeyPress(event) {

      if (event.charCode !== 13) return
      this.isLoading = true
      console.log( this.iframeSrc, this.inputAddr)
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
    onIframeLoad() {
      console.log('iframe 加载完成')
      this.isLoading = false
    },
    onIframeError() {
      console.log('iframe 加载错误')
      this.isLoading = false
    }
  },
  watch: {
    iframeSrc(oldVal, newVal) {
      console.log(`iframeSrc changed from ${oldVal} to ${newVal}`)
    }
  }
}
</script>

<style scoped>
.checkbox-container {
  @apply flex items-center mb-10 justify-end;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-container label {
  @apply cursor-pointer mr-5 mb-0;
}

.checkbox-container input {
  opacity: 0;
  height: 0;
  width: 0;
}

/* Create custom checkbox */
.checkmark {
  @apply cursor-pointer mr-5 mb-0;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 1px #787878;
  border-radius: 3px;
}

/* On mouse-over, add grey background color */
.checkbox-container:hover input ~ .checkmark {
  border-color: rgb(70, 70, 70);
}

/* When checkbox is checked, add green background */
.checkbox-container input:checked ~ .checkmark {
  background-color: rgb(14, 204, 95);
  border: none;
}

/* Create checkmark (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
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
}

.dapp-div1 {
  padding-top: 1vh;
}
</style>

