<template>
  <v-container>
    <Header/>
    <v-row>
      <!--      <v-col cols="6">-->
      <!--        <v-card title="数字钱包" subtitle="数字钱包是用于存储和管理数字资产的软件，支持交易和身份验证。">-->
      <!--          <template v-slot:prepend>-->
      <!--            <v-avatar rounded="0">-->
      <!--              <v-img src="/assets/logo.svg" alt="CT Wallet"/>-->
      <!--            </v-avatar>-->
      <!--          </template>-->
      <!--          <template v-slot:append>-->
      <!--            <v-btn variant="text" icon="mdi-link-variant"></v-btn>-->
      <!--          </template>-->
      <!--        </v-card>-->
      <!--      </v-col>-->
      <v-col cols="12" md="6" @click="toDapp('https://test.ctblock.cn')">
        <v-card title="加密朋友圈"
                text="加密朋友圈是基于区块链的社交平台，通过加密保护用户数据，确保隐私安全，允许用户掌控个人信息，避免数据滥用。">
          <template v-slot:prepend>
            <v-avatar rounded="0">
              <v-img src="/assets/logo.svg" alt="CT Wallet"/>
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-btn variant="text" @click="toDapp('https://test.ctblock.cn')" icon="mdi-link-variant"></v-btn>
          </template>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" @click="toDapp('https://test.ctsign.cn')">
        <v-card title="链上付"
                text="链上付”是一款基于区块链的支付解决方案，提供安全、便捷的数字资产支付与转账服务，连接用户钱包与dApp，实现高效可靠的链上交易体验。">
          <template v-slot:prepend>
            <v-avatar rounded="0">
              <v-img src="/assets/logo.svg" alt="CT Wallet"/>
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-btn variant="text" @click="toDapp('https://test.ctblock.cn')" icon="mdi-link-variant"></v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="12" align="center">
        <small class="text-caption text-medium-emphasis">暂无更多</small>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Header from '../components/Header.vue'

export default {
  name: 'Discover',
  data: function () {
    return {}
  },
  components: {
    Header
  },
  computed: {},
  mounted() {
  },
  methods: {
    toDapp(dappUrl) {
      this.$router.push({
        path: '/dapp',
        query: {
          dappUrl: dappUrl
        }
      })
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>

