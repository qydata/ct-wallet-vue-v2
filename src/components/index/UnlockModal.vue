<template>
  <v-dialog persistent
            :close-on-back="false"
            :close="close"
            width="97%"
            max-width="36rem"
            v-model="localVisible">
    <v-card title="解锁钱包">
      <v-card-text>
        <v-form validate-on="submit lazy"
                ref="myForm">

          <v-list lines="three">
            <v-list-item
              title="钱包地址"
              :subtitle="address"
            />

            <v-list-item
              title="输入密码"
            >
              <v-text-field
                :error-messages="passwordError"
                v-model="password"
                :rules="passwordRules"
                autocomplete="off"
                label="你的密码*"
                @keypress="unlockOnEnter"
                :counter="8"

                :type="showPassword ? 'text' : 'password'"
                :prepend-icon="LockOpenIcon"
                :append-icon="showPassword ? EyeIcon : EyeOffIcon"
                @click:append="showPassword = !showPassword"
                required
                clearable/>

              <small class="text-caption text-medium-emphasis">*表示必填字段</small>
            </v-list-item>
            <v-list-item>
              <v-row>
                <v-col cols="6">
                  <v-btn
                    rounded="xl" block size="x-large"
                    variant="tonal"
                    @click="switchToForgetModal"
                  >
                    忘记钱包
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn rounded="xl" block size="x-large" :loading="isUnlockLoading" @click="unlock">解锁钱包</v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {fetchCardlist} from '@/utils/api'
import * as storage from '@/utils/storage'
import {LockOpenIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'
import {mapState} from 'vuex'
import {getPrivateKey, getPublicKey, getWalletName, setCardList} from '../../utils/storage'

const CryptoJS = require('crypto-js')
const ethers = require('ethers')
export default {
  name: 'UnlockModal',
  components: {},
  data() {
    return {
      password: '',
      showPassword: false,
      isUnlockLoading: false,
      passwordRules: [
        value => {
          if (value) return true
          return '需要密码。'
        },
        value => {
          if (value?.length >= 8) return true
          return '密码必须大于 8 个字符。'
        }
      ],
      passwordError: [],
      // 使用本地副本控制对话框的显示状态
      localVisible: this.visible
    }
  },
  props: {
    afterUnlock: Function,
    close: Function,
    switchToForgetModal: Function,
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    })
  },
  mounted() {
    this.$nextTick(() => {
      console.log(this.$el) // 确保在组件挂载后访问
    })
  },
  watch: {
    visible(newValue) {
      // 当父组件的 prop 更新时，更新本地副本
      this.localVisible = newValue
    },
    localVisible(newValue) {
      // 当本地副本改变时，触发事件通知父组件更新
      this.$emit('update:visible', newValue)
    }
  },
  methods: {
    async checkPassword() {
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = []
        return true
      }
      else {
        this.passwordError = ['密码错误.']
        return false
      }
    },
    sha256(message) {
      return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex)
    },

    async unlock() {
      this.passwordError = []
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return
      try {
        this.isUnlockLoading = true

        if (!await this.checkPassword()) return
        const privateKey = await getPrivateKey(this.password, this.walletVersion)
        const publicKey = await getPublicKey(this.walletVersion)
        const walletName = await getWalletName(this.walletVersion)

        // do not specify wallet version here - this forces migration to highest version
        await storage.setWallet({privateKey, publicKey}, walletName, this.password)
        await storage.setWalletVersion(storage.getHighestWalletVersion())
        this.$store.commit('unlock')
        this.$store.dispatch('refresh')

        const wallet = new ethers.Wallet(privateKey)
        const currentTime = Math.floor(Date.now()).toString() // 获取当前时间戳并转换为字符串
        // 使用钱包签名时间戳

        const signature = await wallet.signMessage(currentTime)

        // 验证签名
        const recoveredAddress = ethers.utils.verifyMessage(currentTime, signature)
        // TODO 获取支付信息
        const requests = [
          {signature: signature, timestamp: currentTime}
        ]
        this.fetchAllData(requests).then(cardList => {
          // console.log('cardList:', cardList)
          setCardList(wallet.address, cardList).then(() => {
            console.log('Object stored successfully!')

          }).catch(err => {
            console.error('Failed to store object:', err)
          })
        })
        this.afterUnlock()
      } catch (e) {
        console.log(e)
      } finally {
        this.isUnlockLoading = false
      }
    },
    async fetchAllData(requests) {
      const results = await Promise.all(requests.map(req => fetchCardlist(req)))
      return results
    },

    async unlockOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      // 如果验证通过，手动触发按钮点击
      await this.unlock()
    }
  },
  setup() {
    return {
      LockOpenIcon, EyeIcon, EyeOffIcon
    }
  }
}
</script>
