<template>
  <div style="">
    <Header/>
    <div class="chat-ui">

      <h2>
        当前共有 <span style="color: #0095ff;">{{ total }}</span> 个消息
      </h2>

      <el-row :gutter="0" style="height: 700px; background: white">
        <el-col :span="8">
          <div class="flex flex-col w-full px-12 pt-12 pb-12  bg-white  rounded-b">
            <div
              v-for="(msg, index) in messageList"
              :class="{
                  'account-panel__address flex flex-col flex-1 px-12 pt-12  rounded-b point': true,
                  'bg-black': index != 0,
                  'pb-12': index != 0,
                  'bg-opacity-60': true,
                  'bg-opacity-100': index == indexItem
                }"
              @click="getJobChatDetail(msg, index)"
              :key="index"
            >
              <div v-if="index == 0">
                <el-button type="success" circle>
                  <el-icon>
                    <Plus/>
                  </el-icon>
                </el-button>
                <el-divider/>
              </div>

              <div v-else>

                <h3 class="mb-1">发送方</h3>
                <span
                >{{
                    hexStripZeros(msg.topics[1])
                  }}{{
                    isMeFun(hexStripZeros(msg.topics[1])) ? '(我)' : ''
                  }}</span
                >
                <h3 class="mb-1">接收方</h3>
                <span
                >{{
                    hexStripZeros(msg.topics[2])
                  }}{{
                    isMeFun(hexStripZeros(msg.topics[2])) ? '(我)' : ''
                  }}</span
                >
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" style="height: 100%;"/>
        </el-col>
        <el-col :span="15">
          <div class="contents">
            <div class="chat-messages">
              <div v-for="(message, index) in messages" :key="message.id">
                <div v-if="message.isMe">
                  <p class="message-nickname-me">
                    {{ addressFormat(address) }} (我)
                  </p>
                  <div class="message-me">
                    <button
                      type="success"
                      :class="
                              'button button--' +
                                (message.isRead ? 'success' : 'error')
                            "
                      @click="dencPass(message, message.text)"
                      v-show="message.denText == ''"
                      shape="circle"
                      size="small"
                    >
                      解密
                    </button>
                    <button
                      shape="circle"
                      size="small"
                      :class="
                              'button button--' +
                                (message.isRead ? 'success' : 'error')
                            "
                    >
                      {{ message.isRead ? '已读' : '未读' }}
                    </button>
                    <p>{{ message.text }}</p>
                  </div>
                </div>
                <div v-else>
                  <div>
                    <p class="message-nickname-other">
                      {{ addressFormat(publisher) }}
                    </p>
                    <div class="message-other">
                      <button
                        type="success"
                        @click="dencPass(message, message.text)"
                        v-show="message.denText == ''"
                        shape="circle"
                        :class="
                                'button button--' +
                                  (message.isRead ? 'success' : 'error')
                              "
                        size="small"
                      >
                        解密
                      </button>
                      <button
                        :type="message.isRead ? 'success' : 'error'"
                        :class="
                                'button button--' +
                                  (message.isRead ? 'success' : 'error')
                              "
                        shape="circle"
                        size="small"
                      >
                        {{ message.isRead ? '已读' : '未读' }}
                      </button>
                      <p>{{ message.text }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <input
                v-model="newMessage"
                size="large"
                style="flex: 4"
                placeholder="在这里输入你要发送的消息"
              />
              <button
                class="button button--success"
                @click.native="sendMessagePass"
              >
                发送
              </button>
            </div>
          </div>
        </el-col>
      </el-row>
      <NewChatModal
        :afterCreate="chatAfter"
        :close="closeModal"
        :visible="modal == 'newChat'"
      />
      <InPasswordModal
        :afterCreate="dencMsg"
        :close="closeModal"
        :visible="modal == 'inPasswordModalDenc'"
      />
      <InPasswordModal
        :afterCreate="sendMessagePassCall"
        :close="closeModal"
        :visible="modal == 'inPasswordModalSend'"
      />
      <LoadingModal
        :afterCreate="sendMessagePassCall"
        :close="closeModal"
        :visible="loading"
      />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import AuthBindModal from '@/components/index/AuthBindModal'
import ChargeModal from '@/components/index/ChargeModal'
import InPasswordModal from '@/components/index/InPasswordModal'
import LoadingModal from '@/components/index/LoadingModal'
import NewChatModal from '@/components/index/NewChatModal'
import PayModal from '@/components/index/PayModal'
import CreateStakeModal from '@/components/stakes/CreateStakeModal'
import DepositModal from '@/components/tx/DepositModal'
import ReceiveModal from '@/components/tx/ReceiveModal'
import SellModal from '@/components/tx/SellModal'
import SendModal from '@/components/tx/SendModal'
import SwapModal from '@/components/tx/SwapModal'
import WithdrawModal from '@/components/tx/WithdrawModal'
import {queryCert} from '@/utils/api'
import * as storage from '@/utils/storage'
import {Plus} from '@element-plus/icons-vue'
import {ArrowDownIcon, ArrowUpIcon, ClipboardCopyIcon, PlusIcon, SwitchHorizontalIcon} from '@heroicons/vue/outline'
import ipfsAPI from 'ipfs-api'
import {mapState} from 'vuex'

const ABI_const = require('@/contract/ABI_const.js')
const ethUtil = require('ethereumjs-util')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const {encryptWithPublicKey, decryptWithPrivateKey} = require('eth-crypto')
const ethers = require('ethers')
const GlobalConfig = require('@/config/GlobalConfig.json')
const Web3 = require('web3')
let web3 = new Web3('http://ctblock.cn/blockChain')
const ipfsNode = ipfsAPI({
  host: '47.102.108.225',
  port: '5001',
  protocol: 'http'
})
const {
  contract_static_call,
  contract_gas_call_override,
  contract_call_override
} = require('../contract/ChainCall')

let ElementPlus = {
  Message: {
    error: info => {
      // console.log(info)
      alert(info)
      // this.passwordError = info
    },
    success: info => {
      // console.log(info)
      alert(info)
    }
  }
}
export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    Plus,
    ArrowDownIcon,
    ArrowUpIcon,
    CreateStakeModal,
    DepositModal,
    PlusIcon,
    ReceiveModal,
    Header,
    SellModal,
    SendModal,
    SwapModal,
    ChargeModal,
    PayModal,
    NewChatModal,
    SwitchHorizontalIcon,
    InPasswordModal,
    AuthBindModal,
    LoadingModal,
    WithdrawModal,
    ClipboardCopyIcon
  },
  computed: mapState(['address', 'balance', 'usdBalance']),
  data() {
    return {
      id: '',
      modal: 'loading',
      addressRQ: '',
      addressRP: '',
      newMessage: '',
      walletName: '',
      canCopy: !!navigator.clipboard,
      item: {
        name: '草田分',
        symbol: 'CT',
        type: 'CT',
        balance: 0
      },
      order: {},
      messageList: [],
      total: 0,
      address: '',
      publisher: '',
      messages: [],
      pubKey: null,
      pubKeyMe: null,
      password: '',
      denc: {
        msg: '',
        text: ''
      },
      indexItem: 1,
      loading: false
    }
  },
  watch: {
    async address() {
      this.walletName = await storage.getWalletName()
    },
    balance(oldVal, newVal) {
      // console.log('balance newVal', newVal)
      this.item.balance = newVal
    }
  },
  filters: {},
  async mounted() {
    this.walletName = await storage.getWalletName()
    this.address = await storage.getAddress(storage.getHighestWalletVersion())
    this.getJobchats()
  },
  methods: {
    processMsg(message, index) {
      // console.log(message)
      // console.log(index)

      let oText
      if (message.isMe) {
        oText = message.messageRQ
      }
      else {
        oText = message.messageRP
      }

      if (message.pubKeyRP == undefined) {
        return oText
      }

      // 解密
      // 使用私钥解密信息
      // const privateKey = await storage.getPrivateKey(this.password)
      // let decText = await decryptWithPrivateKey(privateKey, oText)
      return oText
    },
    addressFormat(value) {
      if (!value) return '0x00...0000'
      if (value.length > 8) {
        return `${value.substring(0, 4)}****${value.substring(
          value.length - 4
        )}`
      }
      return value
    },
    chatAfter(toAddress, firstMessage, password) {
      // 发送明文消息
      console.log(toAddress, firstMessage, password)
      // 加密信息(我的公钥)
      this.sendMessage(toAddress, firstMessage, password, true)
      let that = this
      window.setTimeout(() => {
        that.getJobchats()
      }, 10000)
      this.modal = ''
    },
    closeModal() {
      this.modal = ''
    },
    dencPass(msg, text) {
      this.denc.msg = msg
      this.denc.text = text
      this.modal = 'inPasswordModalDenc'
    },
    async dencMsg(password) {
      this.modal = ''
      let msg = this.denc.msg
      let text = this.denc.text
      console.log('msg', msg)
      console.log('text', JSON.parse(JSON.stringify(text)))
      if (msg.denText == '') {
        const privateKey = await storage.getPrivateKey(password)
        let customHttpProvider = new ethers.providers.JsonRpcProvider(
          this.$store.state.config.blockchain.baseURL,
          {
            chainId: 27
          }
        )
        let wallet = new ethers.Wallet(privateKey, customHttpProvider)

        console.log(wallet.privateKey)
        msg.denText = await decryptWithPrivateKey(privateKey, text)
        msg.text = msg.denText
        window.localStorage.setItem(msg.ori.transactionHash, true)
        msg.isRead = true
      }
      else {
        msg.text = msg.denText
      }
    },
    sendMessagePass() {
      // publisher, newMessage,password,false
      // 判断是否选中了发送列表
      if (this.messages.length == 0) {
        this.modal = 'newChat'
      }
      else {
        this.modal = 'inPasswordModalSend'
      }
      // sendMessagePass(publisher, newMessage,password,false)
    },
    async sendMessagePassCall(password) {
      this.modal = ''
      this.sendMessage(this.publisher, this.newMessage, password, false)
    },
    async sendMessage(toAddress, firstMessage, password, isFirst) {
      console.log('sendMessage')
      let that = this

      this.loading = true

      // 上传ipfs
      // 加密信息
      // 公钥加密
      let publicKey = await storage.getPublicKey(
        storage.getHighestWalletVersion()
      ) // 公钥
      // 使用公钥加密信息
      publicKey = ethUtil.stripHexPrefix(publicKey)
      const encMsgRQ = await encryptWithPublicKey(publicKey, firstMessage)
      // 使用对方公钥加密消息
      let encMsgRP
      if (isFirst || this.pubKey == null) {
        encMsgRP = firstMessage
      }
      else {
        encMsgRP = await encryptWithPublicKey(that.pubKey, that.newMessage)
      }

      console.log('encMsgRQ', encMsgRQ)
      console.log('encMsgRP', encMsgRP)
      // if (encMsgRQ.substring(0, 6) == 'Error:') {
      //   console.log('加密消息失败')
      //   return
      // }
      // if (encMsgRP.substring(0, 6) == 'Error:') {
      //   console.log('加密消息失败')
      //   return
      // }
      // 这里为了方便自己查阅消息, 也要使用
      // 自己的公钥加密一份数据, 这样自己使用私钥就可以查看自己发送的消息
      let message = {
        messageRQ: encMsgRQ,
        pubKeyRQ: publicKey,
        messageRP: encMsgRP,
        pubKeyRP: this.pubKey
      }

      let responseRet = await ipfsNode
        .add(Buffer.from(JSON.stringify(message), 'utf-8'))
        .then(resp => {
          return {err: null, data: resp}
        })
        .catch(err => {
          console.trace(err)
          return {err: err, data: null}
        })

      console.log(responseRet.data[0].path)

      // 上传链
      let jobContract = GlobalConfig.JOBCONTRACT_ADDRESS
      let overrride = {
        from: this.address
      }

      // 计算房间号码
      // 对比两个地址的大小
      const privateKey = await storage.getPrivateKey(password)

      let customHttpProvider = new ethers.providers.JsonRpcProvider(
        this.$store.state.config.blockchain.baseURL,
        {
          chainId: 27
        }
      )
      let param = [toAddress, responseRet.data[0].path]
      let wallet = new ethers.Wallet(privateKey, customHttpProvider)
      let tx = await contract_call_override(
        // let resp = await contract_estimateGas_call(
        ethers,
        wallet,
        jobContract,
        ABI_const['JobContract'].abi,
        'sendMessage',
        customHttpProvider,
        param,
        overrride
      )
      console.log(tx)
      if (tx.data == null) {
        ElementPlus.Message.error('发生错误')
        this.loading = false
      }
      console.log('tx:', tx)
      if (tx.data == null) {
        ElementPlus.Message.error('发生错误')
        this.loading = false
      }
      await tx.data.wait()
      console.log(tx.data.hash)
      if (tx.data != null) {
        ElementPlus.Message.success('发送成功')
        // 这里切换最新的聊天列表
        that.getJobChat()
        that.newMessage = ''
      }
      else {
        ElementPlus.Message.error('发送失败')
      }
      this.loading = false
    },
    getJobChatDetail(msg, index) {
      if (index == 0) {
        // 新建聊天
        this.modal = 'newChat'
      }
      else {
        this.loading = true
        // 已经存在对话
        console.log(msg.topics[0])
        // 这里不用区分谁是谁, 会自动排序计算房间号
        // 复制 publisher
        let addr1 = this.hexStripZeros(msg.topics[1])
        let addr2 = this.hexStripZeros(msg.topics[2])
        if (this.isMeFun(addr1)) {
          this.publisher = addr2
        }
        if (this.isMeFun(addr2)) {
          this.publisher = addr1
        }

        this.addressRQ = addr1
        this.addressRP = addr2
        this.indexItem = index
        this.getJobChat()
      }
    },
    hexStripZeros(val) {
      return ethers.utils.hexStripZeros(val)
    },

    isMeFun(address) {
      if (this.address.toLowerCase() == address.toLowerCase()) {
        return true
      }
      else {
        return false
      }
    },
    async getJobChat() {
      let that = this

      let topic = ethers.utils.id(
        // "jobChatItem(address,address)"
        'jobChat(bytes32,address,address,string)'
      )

      console.log('===', that.address)
      console.log('===', ethers.utils.hexZeroPad(that.address, 32))
      let toBlock = window.localStorage.getItem('blockNumber')
      let fromBlock = Number(toBlock) - 30000
      let _from = this.address
      let _to = this.publisher
      // 计算房间号码
      // 对比两个地址的大小

      const addresses = [this.addressRP, this.addressRQ]

      addresses.sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) {
          return -1
        }
        if (a.toLowerCase() > b.toLowerCase()) {
          return 1
        }
        return 0
      })

      console.log(addresses)
      let abiCode =
        '0x' +
        web3.utils.stripHexPrefix(addresses[0]) +
        web3.utils.stripHexPrefix(addresses[1])
      let hash = web3.utils.keccak256(abiCode)
      console.log(hash)
      this.id = hash
      // hash = "0x0e11fc7ad4191b6de8b9a13638fd17c99e0cb510c03c7ca71c05adac61b5f106";
      //计算起始区块
      let filter = {
        address: GlobalConfig.JOBCONTRACT_ADDRESS,
        fromBlock: Number(fromBlock), // 1天的数据
        toBlock: Number(toBlock),
        // topics: [topic, ethers.utils.hexZeroPad(that.address, 32)],
        topics: [topic, this.id, null, null]
        // ethers.utils.hexZeroPad(_to, 32)],
        // topics: [topic],
      }
      // that.loading = true;
      let customHttpProvider = new ethers.providers.JsonRpcProvider(
        this.$store.state.config.blockchain.baseURL,
        {
          chainId: 27
        }
      )
      let resp_ret = await customHttpProvider.getLogs(filter).then(result => {
        return result
      })

      console.log(resp_ret)
      let allMessages = resp_ret

      // {id: 2, text: 'Hello!', isMe: true},
      let messages = []
      let noMe = true
      for (const allMessagesKey in allMessages) {
        let obj = allMessages[allMessagesKey]
        // console.log('obj', obj)

        let isMe
        if (
          ethers.utils
            .hexStripZeros(obj.topics[2])
            .toString()
            .toLowerCase() == _from.toLowerCase()
        ) {
          isMe = true
          noMe = false
        }
        else if (
          ethers.utils
            .hexStripZeros(obj.topics[3])
            .toString()
            .toLowerCase() == _from.toLowerCase()
        ) {
          isMe = false
        }
        else {
          that.$router.go(-1)
        }
        let tempObj

        let content = ethers.utils.defaultAbiCoder.decode(
          ['string'],
          obj.data
        )[0]
        let isRead = false
        let isReadTemp = window.localStorage.getItem(obj.transactionHash)
        if (isReadTemp && isReadTemp == 'true') {
          isRead = true
        }
        // ipfs资源获取
        if (content.substring(0, 2) == 'Qm') {
          // 查询ipfs元数据
          let responseRet = await ipfsNode
            .cat(content)
            .then(resp => {
              return {err: null, data: resp}
            })
            .catch(err => {
              console.trace(err)
              return {err: err, data: null}
            })
          let metaOriData = responseRet.data.toString('utf8')
          metaOriData = JSON.parse(metaOriData)
          console.log(metaOriData)

          tempObj = {
            id: allMessagesKey,
            messageRP: metaOriData.messageRP,
            messageRQ: metaOriData.messageRQ,
            pubKeyRP: metaOriData.pubKeyRP,
            pubKeyRQ: metaOriData.pubKeyRQ,
            denText: '',
            isRead: isRead,
            isMe: isMe,
            ori: obj
          }
          tempObj.text = this.processMsg(tempObj, allMessagesKey)
          // 对对方公钥赋值
          if (!isMe && this.pubKey == null) {
            this.pubKey = metaOriData.pubKeyRQ
          }
          else if (this.pubKeyMe == null) {
            that.pubKeyMe = metaOriData.pubKeyRP
          }
        }
        else {
          tempObj = {
            id: allMessagesKey,
            text: content,
            isMe: isMe,
            isRead: isRead,
            denText: '',
            ori: obj
          }
        }

        messages.push(tempObj)
        console.log('messages', messages)
      }

      // 没有我的公钥缓存, 将通过metamask获取
      if (noMe && this.pubKeyMe == '') {
        that.pubKeyMe = await storage.getPublicKey(
          storage.getHighestWalletVersion()
        ) // 公钥
      }

      this.messages = messages
      this.loading = false
    },
    async getJobchats() {
      let that = this

      let topic = ethers.utils.id(
        'jobChatItem(address,address)'
        // "jobChat(address,address,string)"
      )

      console.log('===', that.address)
      console.log('===', ethers.utils.hexZeroPad(that.address, 32))
      let toBlock = window.localStorage.getItem('blockNumber')
      let fromBlock = Number(toBlock) - 30000
      //计算起始区块

      that.loading = true
      let customHttpProvider = new ethers.providers.JsonRpcProvider(
        this.$store.state.config.blockchain.baseURL,
        {
          chainId: 27
        }
      )
      // 我发出的
      let filter = {
        address: GlobalConfig.JOBCONTRACT_ADDRESS,
        fromBlock: Number(fromBlock), // 1天的数据
        toBlock: Number(toBlock),
        // topics: [topic, ethers.utils.hexZeroPad(that.address, 32)],
        topics: [topic, ethers.utils.hexZeroPad(that.address, 32), null]
        // topics: [topic],
      }
      let resp_ret = await customHttpProvider.getLogs(filter).then(result => {
        return result
      })

      //  我接受的
      let filterR = {
        address: GlobalConfig.JOBCONTRACT_ADDRESS,
        fromBlock: Number(fromBlock), // 1天的数据
        toBlock: Number(toBlock),
        // topics: [topic, ethers.utils.hexZeroPad(that.address, 32)],
        topics: [topic, null, ethers.utils.hexZeroPad(that.address, 32)]
        // topics: [topic],
      }
      let resp_retR = await customHttpProvider
        .getLogs(filterR)
        .then(resultR => {
          return resultR
        })
      that.messageList = resp_ret.concat(resp_retR)

      that.messageList.unshift({
        new: true
      })
      console.log(that.messageList)

      that.total = this.messageList.length - 1
      if (that.total > 1) {
        // 复制 publisher
        let addr1 = this.hexStripZeros(this.messageList[1].topics[1])
        let addr2 = this.hexStripZeros(this.messageList[1].topics[2])
        if (this.isMeFun(addr1)) {
          this.publisher = addr2
        }
        if (this.isMeFun(addr2)) {
          this.publisher = addr1
        }

        this.addressRQ = addr1
        this.addressRP = addr2
        this.getJobChat()
      }
      that.loading = false
    },

    closeCharge() {
      this.modal = ''
    },
    openPay(order) {
      console.log(order)
      this.order = order
      this.modal = 'pay'
    },
    closePay() {
      this.modal = ''
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('剪贴板不可用。请手动复制粘贴。')
      return navigator.clipboard.writeText(input)
    },
    async createOnEnter(event) {
      if (event.charCode !== 13) return
      // 修改钱包名称
      await storage.setWalletName(
        this.walletName,
        this.address,
        storage.getHighestWalletVersion()
      )
    },

    openCreateStake() {
      this.modal = 'createStake'
    },
    openDeposit() {
      this.modal = 'deposit'
    },
    async authJudge(oriName) {
      // 查询实名状态
      let address = await storage.getAddress(storage.getHighestWalletVersion())
      queryCert({address: address})
        .then(res => {
          if (res.code !== 200) {
            console.log(res.msg)
          }
          else if (!res.is_cert) {
            let r = confirm(
              '当前账户未进行实名认证, 认证过后才可以进行手续费接收和充值, 点击确认去认证!'
            )
            if (r == true) {
              console.log('You pressed OK!')
              this.modal = 'authBind'
            }
          }
          else {
            this.modal = oriName
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    async openReceive() {
      await this.authJudge('receive')
    },
    openSell() {
      this.modal = 'sell'
    },
    openSend() {
      this.modal = 'send'
    },
    openSwap() {
      this.modal = 'swap'
    },
    async openCharge() {
      // 查询实名状态
      await this.authJudge('charge')
    },
    openWithdraw() {
      this.modal = 'withdraw'
    },
    reset() {
      this.modal = ''
    }
  }
}
</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__left,
.account-panel__right {
  @apply w-full;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7 w-full;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__balance h3 {
  @apply text-green mb-5;
}

.account-panel__balance h2 {
  @apply text-gray-300 text-md mb-0;
}

.account-panel__balance h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

#walletName {
  padding-left: 0;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

.account-panel__modals {
  width: 1px;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

  .account-panel__buttons.staking-buttons {
    @apply grid-cols-1;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__buttons.staking-buttons > button {
    width: 170px;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.contents {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 15px;
}

.chat-messages {
  flex: 1;
  overflow-y: scroll;
  overflow: hidden;

}

.message-me {
  background-color: #eee;
  padding: 8px;
  border-radius: 4px;
  align-self: flex-end;
  margin: 4px 4px 4px 20%;
  overflow-wrap: break-word;
}

.message-nickname-me {
  margin: 8px 4px -5px 20%;
  padding: 0;
  text-align: right;
  background-color: #fff;
}

.message-other {
  /*background-color: #fff;*/
  background-color: #eee;
  padding: 8px;
  border-radius: 8px;
  align-self: flex-start;
  margin: 4px 20% 4px 4px;
  overflow-wrap: break-word;
}

.message-nickname-other {
  margin: 8px 20% -5px 4px;
  padding: 0;
  align-self: flex-start;
  padding: 4px;
  background-color: #fff;
}

.chat-input {
  display: flex;
  margin-top: 16px;
}

.point {
  cursor: pointer;
}

.chat-ui {
  margin: 50px 100px;

}
</style>
