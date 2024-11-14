<template>
  <modal
    name="dappCallRequestModal"
    classes="p-2"
    styles="overflow: visible"
    :width="800"
    height="auto"
    :click-to-close="false"
    :scrollable="true"
  >

    <ModalInter :close="cancel" :visible="success">
      <template v-slot:header>
        <h2 class="mb-8">{{ requestName }} </h2>

      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-310">
          <div v-if="this.connector && this.request" class=" grid grid-cols-1">
            <div v-if="peerMeta.icons.length" class="col-4">
              <el-image
                :src="peerMeta.icons[0]"
                class="img-fluid rounded-start w-80"
                :alt="peerMeta.name + '-icon'"
              />
            </div>
            <div class="col-8">
              <div class="card-body">
                <div>
                  <wallet-connect-request-details
                    :request="request"
                    :connector="connector"
                    @getRequestedWalletConnectNetwork="
                  setRequestedWalletConnectNetwork
                "
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="form-group mt-5"
               v-if="requestName != 'New Session'"
               :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <label for="password">输入密码</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <el-input
                size="large"
                type="password"
                autocomplete="off"
                placeholder="你的密码"
                id="password"
                v-model="v$.password.$model"
              />
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">
              {{ error.$message }}
            </div>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{ passwordError }}
            </div>
          </div>

        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-2">
            <el-button
              type="primary"
              plain
              size="large"
              @click.prevent="handleRequest(false)"
            >
              拒绝
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="isLoading"
              :disabled="!isApprovalReady"
              @click.prevent="handleRequest(true)"
            >
              批准
            </el-button>

          </div>
        </div>
      </template>
    </ModalInter>

  </modal>
</template>

<script>
import {getPrivateKey} from '../../utils/storage'
import ModalInter from '../ModalInter.vue'
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
import {helpers, required as _required} from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import {LockOpenIcon, PencilIcon, ShieldExclamationIcon} from '@heroicons/vue/outline'

export default {
  name: 'DappCallRequestModal',
  components: {
    ModalInter,
    LockOpenIcon,
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
      passwordError: '',
      wallet: '',
      requestedWalletConnectNetwork: '',
      wallets: [],
      password: '',
      success: true,
      isLoading: false
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
      if (this.request.method === 'session_proposal')
        return walletConnectRequests[this.request.method]
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
      v$: useVuelidate()
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
    handleRequest(userApproved) {
      return this.handleWCRequest(userApproved)
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    async handleWCRequest(userApproved) {
      // 解密钱包
      let privateKey
      if (userApproved && this.requestName != 'New Session') {
        this.passwordError = ''

        if (!await this.v$.$validate()) return
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
        if (userApproved)
          this.$message.success(`${this.requestName} 请求已获得批准。`)
        else
          this.$message.error(
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
        if (!this.address)
          throw new Error('You must select a wallet to start a session.')
        this.$store.dispatch('web3Connections/handleWCSessionProposal', {
          approved: userApproved,
          wallet: this.address,
          proposal: this.request
        })
      }
    },
    rejectWCRequest(message) {
      let response = {
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
        if (userApproved)
          this.$message.success(`${reqName} request has been approved.`)
        else
          this.$message.error(
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
