<template>
  <v-dialog
    persistent
    :close-on-back="false"
    :close="cancel"
    max-width="36rem"
    v-model="success"
  >

    <v-card :title="requestName">

      <v-card-item>
        <v-row v-if="this.connector && this.request">
          <v-col v-if="peerMeta.icons.length" cols="2">
            <v-avatar
              rounded="0"
            >
              <v-img
                :src="peerMeta.icons[0]"
                :lazy="true"
                loading="lazy"
                :alt="peerMeta.name + '-icon'"
              />
            </v-avatar>
          </v-col>
          <v-col cols="10">
            <wallet-connect-request-details
              :request="request"
              :connector="connector"
              @getRequestedWalletConnectNetwork="
                  setRequestedWalletConnectNetwork
                "
            />
          </v-col>
        </v-row>
      </v-card-item>

      <v-card-item v-if="requestName != 'New Session'">
        <v-form ref="myForm">
          <v-card-item
            title="输入密码"
          >
            <v-text-field
              :error-messages="passwordError"
              v-model="password"
              :rules="passwordRules"
              autocomplete="off"
              label="你的密码*"
              :counter="8"

              :type="showPassword ? 'text' : 'password'"
              :prepend-icon="LockOpenIcon"
              :append-icon="showPassword ? EyeIcon : EyeOffIcon"
              @click:append="showPassword = !showPassword"
              required
              clearable/>
          </v-card-item>
        </v-form>
      </v-card-item>
      <v-card-item>
        <v-row>
          <v-col cols="6">
            <v-btn rounded="xl" block size="x-large"
                   variant="tonal" @click="handleRequest(false)">拒绝
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn rounded="xl" block size="x-large"
                   :loading="isLoading"
                   :disabled="!isApprovalReady"
                   @click="handleRequest(true)">批准
            </v-btn>
          </v-col>
        </v-row>
      </v-card-item>
      <v-card-item></v-card-item>
    </v-card>

  </v-dialog>
</template>

<script>
import {getPrivateKey} from '../../utils/storage'
import WalletConnectRequestDetails from './WalletConnectRequestDetails.vue'
import * as storage from '@/utils/storage'
import {mapState} from 'vuex'

const walletConnectRequests = {
  session_proposal: 'New Session',
  eth_sendTransaction: 'Send Transaction',
  eth_signTransaction: 'Sign Transaction',
  eth_signTypedData: 'Sign Typed Data',
  eth_sign: 'Sign',
  personal_sign: 'Personal Sign',
  wallet_switchEthereumChain: 'Switch Ethereum Chain'
}
import {required as _required, helpers} from '@vuelidate/validators'
import {LockOpenIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'

export default {
  name: 'DappCallRequestModal',
  components: {
    WalletConnectRequestDetails
  },
  props: {
    fmodal: Object,
    request: Object,
    connector: Object
  },

  validations() {
    return {
      password: [
        helpers.withMessage('请填写密码', _required)
      ]
    }
  },
  data() {
    return {
      passwordError: [],
      wallet: '',
      requestedWalletConnectNetwork: '',
      wallets: [],
      password: '',
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
      success: true,
      isLoading: false,
      showPassword: false
    }
  },
  computed: {
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    }),
    isApprovalReady() {
      // Used to disable approve button if requirements are not met
      let isReady = true
      if (!this.wallet) {
        isReady = false
      }

      return isReady
    },

    requestName() {
      // Format Wallet Connect V2 Request Name
      if (this.request.method === 'session_proposal') return walletConnectRequests[this.request.method]
      const method = this.request.params.request.method
      return walletConnectRequests[method]
    },
    peerMeta() {
      if (!this.request) return
      if (this.request.method === 'session_proposal') {
        // Wallet Connect V2 Session Proposal Peer Meta
        return this.request.params.proposer.metadata
      }
      else if (this.request.method === 'session_request') {
        // Wallet Connect V2 Session Request Peer Meta
        const {sessions} = this.$store.state.web3Connections.walletConnect
        return sessions[this.request.topic].peer.metadata
      }
      return {
        icons: [],
        name: 'Peer Data Not Found'
      }
    }
  },
  async mounted() {
    this.wallets = await storage.getWalletList(storage.getHighestWalletVersion())
    this.wallet = this.address
  },
  setup() {
    return {
      LockOpenIcon, EyeIcon, EyeOffIcon
    }
  },
  methods: {
    cancel() {
      console.log('cancel')
    },
    closeModal() {
      this.fmodal.hide('dappCallRequestModal')
    },
    onModalOpen(event) {
      const {request, connector, wallet} = event.params
      this.wallet = wallet
    },
    displayError(err) {
      console.error('Error:: ', err)
      this.$message.error(err.message, 'Error')
    },
    resetState() {
      this.wallet = null
      this.requestedWalletConnectNetwork = null
    },
    setRequestedWalletConnectNetwork(network) {
      this.requestedWalletConnectNetwork = network
    },
    async handleRequest(userApproved) {

      return await this.handleWCRequest(userApproved)
    },
    async checkPassword() {
      this.passwordError = []
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = []
        return true
      }
      else {
        this.passwordError = ['密码错误.']
        return false
      }
    },
    async handleWCRequest(userApproved) {
      // 解密钱包
      let privateKey
      if (userApproved && this.requestName != 'New Session') {
        this.passwordError = []
        const {valid, errors} = await this.$refs.myForm.validate()
        if (!valid) return
        if (!await this.checkPassword()) return
        privateKey = await getPrivateKey(this.password, this.walletVersion)
      }
      try {

        this.isLoading = true

        // Update configured network
        // TODO 网络这里先不做判断
        const userSelectedNetwork = 27
        const networksMatch =
          userSelectedNetwork === this.requestedWalletConnectNetwork
        const networkConfigNeeded =
          userApproved && this.requestedWalletConnectNetwork
        if (!networksMatch && networkConfigNeeded) {

          // await this.$store.dispatch('userSettings/updateNetworkSelection', {
          //   coinTicker: 'ct',
          //   network: this.requestedWalletConnectNetwork
          // })
        }

        if (this.request.method === 'session_request') {
          await this.$store.dispatch(
            'web3Connections/handleWCSessionRequest',
            {
              approved: userApproved,
              request: this.request,
              wallet: {privateKey}
            }
          )
        }
        else if (this.request.method === 'session_proposal') {
          await this.handleWCSessionProposal(userApproved)
        }
        else {
          // Wallet Connect V1 Request Handler
          await this.$store.dispatch('web3Connections/handleWCCallRequest', {
            request: this.request,
            approved: userApproved,
            wallet: {privateKey}
          })
        }

        // Display toast confirming user approval/rejection
        if (userApproved) this.$message.success(`${this.requestName} 请求已获得批准。`)
        else this.$message.error(
          `${this.requestName} 请求已被用户拒绝。`,
          'Rejected'
        )
      } catch (err) {
        this.isLoading = false
        this.displayError(err)
      } finally {
        this.closeModal()
      }
    },
    handleWCSessionProposal(userApproved) {
      if (!userApproved) {
        this.rejectWCRequest('Request was rejected.')
        this.connector.disconnect({
          // 传入当前会话的 topic
          topic: this.request.topic,
          reason: {
            code: 6000,
            message: 'User disconnected'
          }
        })
      }
      else {
        if (!this.address) throw new Error('You must select a wallet to start a session.')
        this.$store.dispatch('web3Connections/handleWCSessionProposal', {
          approved: userApproved,
          wallet: this.address,
          proposal: this.request
        })
      }
    },
    rejectWCRequest(message) {
      const response = {
        id: this.request.id,
        reason: {
          // 错误代码，4001 通常表示用户拒绝
          code: 4001,
          message: message
        }
      }
      this.connector.rejectSession(response)
      this.closeModal()
    },
    async handleWBRequest(userApproved) {
      try {
        await this.$store.dispatch('web3Connections/handleWBRequest', {
          approved: userApproved,
          request: this.request,
          wallet: this.wallet
        })

        // format request success toast details
        let reqName = this.requestName
        reqName = reqName[0].toUpperCase() + reqName.slice(1)

        // Display toast confirming user approval/rejection
        if (userApproved) this.$message.success(`${reqName} request has been approved.`)
        else this.$message.error(
          `${reqName} request has been rejected by user.`,
          'Rejected'
        )

        this.closeModal()
      } catch (err) {
        this.displayError(err)
      }
    }
  }
}

</script>

<style scoped>
</style>
