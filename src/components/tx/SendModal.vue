<template>
  <div>
    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible1">
      <v-card :title="'发送' + localItem.name + '(' + localItem.symbol + ')'">
        <template v-slot:subtitle>
          <v-card-subtitle>
            <Amount :value="balance" currency="CT"/>
            可用
          </v-card-subtitle>

          <v-card-subtitle v-if="localItem.type != 'CT'">
            <Amount :value="formattedAmount" :currency="localItem.name+'('+localItem.symbol+')'"/>
            可用
          </v-card-subtitle>
        </template>


        <v-card-text>
          <v-form validate-on="submit lazy"
                  ref="myForm">
            <v-list lines="six">
              <v-list-item
                title="发送到"
                subtitle=""
              >
                <v-text-field
                  v-model="recipient"
                  :rules="recipientRules"
                  autocomplete="off"
                  label="CT 地址*"

                  type="text"
                  required
                  clearable/>
              </v-list-item>

              <v-list-item
                v-show="false"
                title="备忘录 (可选)"
              >
                <v-text-field
                  v-model="memo"
                  autocomplete="off"
                  label="输入一个备忘录"

                  type="text"
                  required
                  clearable/>
              </v-list-item>
              <v-list-item>
                <v-row>

                  <v-col :cols="item.type !== 'CT' ? 12 : 8">
                    <v-text-field
                      v-model="amount"
                      :rules="amountRules"
                      autocomplete="off"
                      label="数量"
                      type="text"
                      required
                      clearable>
                      <template v-slot:append>
                        <div v-if="item.type !== 'CT'">
                          <v-chip variant="text">
                            {{ item.type }}
                          </v-chip>
                        </div>
                      </template>

                    </v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <div v-if="item.type != 'CT'">
                    </div>

                    <div v-else>
                      <v-select
                        variant="default"
                        v-model="localItem"
                        :items="items"
                        item-title="coin"
                        hide-details
                        item-value="coin"
                        return-object
                      ></v-select>
                    </div>
                  </v-col>
                </v-row>
                <v-btn size="small" @click="setAmountAsPercent(100)">
                  最大值
                </v-btn>
              </v-list-item>
              <small class="text-caption text-medium-emphasis">*表示必填字段</small>
              <v-divider/>
              <v-list-item>
                <v-row>
                  <v-col cols="6">
                    <v-btn rounded="xl" block size="x-large"
                           variant="tonal" @click="cancel">返回
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn rounded="xl" block size="x-large"
                           @click="readySend">发送
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-form>
        </v-card-text>
      </v-card>

    </v-dialog>

    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible2">


      <v-card :title="'发送' + localItem.name + '(' + localItem.symbol + ')'">
        <template v-slot:subtitle>
          <v-card-subtitle>
            <Amount :value="balance" currency="CT"/>
            可用
          </v-card-subtitle>
          <v-card-subtitle v-if="localItem.type != 'CT'">
            <Amount :value="formattedAmount" :currency="localItem.name+'('+localItem.symbol+')'"/>
            可用
          </v-card-subtitle>
        </template>
        <v-card-text>
          <v-form validate-on="submit lazy"
                  ref="myForm1">
            <v-list lines="six">
              <v-list-item title="发送到" :subtitle="recipient"></v-list-item>
              <v-list-item v-show="false" title="备忘录" :subtitle="memo || 'None'"></v-list-item>
              <v-list-item title="数量">
                <v-list-item-subtitle>
                  <Amount :value="amountParsed" :currency="localItem.name+'('+localItem.symbol+')'" short sub/>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item title="手续费">
                <v-list-item-subtitle>
                  <Amount :value="gas" currency="CT" short sub/>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item title="接收人收到">
                <v-list-item-subtitle>
                  <Amount :value="amountParsedCalc" :currency="localItem.name+'('+localItem.symbol+')'" short sub/>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-list-item
              title="输入密码以加密此会话"
            >
              <v-text-field
                :error-messages="passwordError"
                v-model="password"
                :rules="passwordRules"
                autocomplete="off"
                label="你的密码*"
                @keypress="sendOnEnter"
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
              <v-btn rounded="xl" block size="x-large" @click="send">确认交易</v-btn>
            </v-list-item>
            <v-list-item v-if="submitError">
              <v-list-item-subtitle>
                {{ submitError }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-form>
        </v-card-text>
      </v-card>

    </v-dialog>

    <v-dialog persistent
              :close-on-back="false"
              :close="cancel"
              width="99%"
              max-width="36rem"
              v-model="localVisible3">


      <v-card title="交易已发送">

        <v-card-text>
          <v-list>
            <v-list-item title="接收人" :subtitle="recipient"></v-list-item>
            <v-list-item v-show="false" title="备忘录" :subtitle="memo || 'None'"></v-list-item>
            <v-list-item title="数量">
              <v-list-item-subtitle>
                <Amount :value="amount" currency="CT" short sub/>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item title="手续费">
              <v-list-item-subtitle>
                <Amount :value="(completedTx.gasPrice * completedTx.gasLimit)/1e18" currency="CT" short sub/>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item title="接收人收到">
              <v-list-item-subtitle>
                <Amount :value="amount" :currency="localItem.name" short sub/>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item title="交易哈希">
              <v-list-item-subtitle>
                <HashLink to="explorer" :transaction="completedTx.hash" truncated/>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-btn rounded="xl" block size="x-large"
                     variant="tonal" @click="cancel">关闭
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

    </v-dialog>

    <LoadingModal :visible="loading"/>

  </div>
</template>

<script>
/*global process*/

import LoadingModal from '@/components/index/LoadingModal'
import {parseAmount} from '@/utils/form'
import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import useVuelidate from '@vuelidate/core'
import {mapState} from 'vuex'
import Amount from '../Amount'
import HashLink from '../HashLink'
import Modal from '../Modal'
import Radio from '../Radio'
import {ClipboardCopyIcon, LockOpenIcon, ShieldExclamationIcon, EyeIcon, EyeOffIcon} from '@heroicons/vue/outline'

const Web3 = require('web3')
const ABI_const = require('@/contract/ABI_const.js')
const ethers = require('ethers')
const memoRegexp = /^[a-zA-Z0-9\s-]{0,32}$/
const TRANSACTION_RECEIPT_STATUS = {
  SUCCESS: 1,
  REVERTED: 0
}
const {contract_static_call, contract_gas_call_override, contract_call_override} = require('../../contract/ChainCall')
export default {
  name: 'SendModal',
  components: {
    LoadingModal,
    Amount,
    HashLink,
    LockOpenIcon,
    Modal,
    Radio
  },
  props: {
    close: Function,
    visible: Boolean,
    item: {
      type: Object,
      default: () => ({
        type: 'CT',
        balance: 0
      })
    }

  },
  data() {
    return {
      step: 1,

      recipient: '',
      amount: '',
      recipientRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {
          const ctAddressRegexp = /^0x[a-fA-F0-9]{40}$/
          /**
           * CT address validator.
           */
          let ret = ctAddressRegexp.test(value)
          if (ret) return true
          return '无效的草田链地址.'
        }],
      amountRules: [
        value => {
          if (value) return true
          return '需要一个值。'
        },
        value => {

          let _bal
          if (this.localItem == null || this.localItem.type === 'CT') {
            _bal = this.balance
          }
          else {
            _bal = this.localItem.balance
          }

          if (isNaN(parseAmount(value))) {
            return '无效的金额。'
          }
          if (isNaN(_bal)) {
            return '无效的金额。'
          }
          if (_bal <= parseAmount(value)) {
            return '余额不足。'
          }
          return true
        }
      ],
      memo: '',
      password: '',
      passwordError: [],
      showPassword: false,
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
      completedTx: null,
      submitError: '',
      gas: 0,
      loading: false,

      // 使用本地副本控制对话框的显示状态
      localVisible1: false,
      localVisible2: false,
      localVisible3: false,
      localItem: {
        name: '草田分',
        symbol: 'CT',
        coin: 'CT',
        type: 'CT',
        index: 0,
        balance: '0',
        decimals: 18
      },
      items: [
        {
          name: '草田分',
          symbol: 'CT',
          coin: 'CT',
          type: 'CT',
          balance: '0',
          index: 0,
          decimals: 18
        },
        {
          name: '人民币代币(TEST)',
          symbol: 'RMB',
          coin: 'RMB',
          type: 'ERC-20',
          contractAddress: '0x60A4fFEAd5F99dA661eb931E313FaDd1f139f773',
          balance: '0',
          index: 1,
          decimals: 2
        }
      ]
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce', 'xctBalance']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    amountParsedCalc() {
      if (this.localItem.type == 'CT') {
        // return parseAmount(this.amount) - this.gas
        return parseAmount(this.amount)
      }
      else {
        return parseAmount(this.amount)
      }
    },
    isMaxAmountEntered() {
      switch (this.localItem.type) {
      case 'ERC-20':
      case 'ERC-721':
      case 'ERC-1155':
        return this.localItem.balance > 0 && this.amountParsed === this.localItem.balance / 1e6
      default:
        return this.balance > 0 && this.amountParsed === this.balance / 1e6
      }
    },
    formattedAmount() {
      console.log(this.localItem)
      console.log(this.localItem.decimals)
      console.log(this.localItem.balance)
      if (this.localItem.decimals == '' || this.localItem.decimals == null || this.localItem.balance.indexOf('.') !== -1) {
        return Number(this.localItem.balance)
      }
      else {
        return Number(ethers.utils.formatUnits(this.localItem.balance, this.localItem.decimals))
      }
    }
  },
  watch: {
    localItem(newValue, oldv) {
      console.log('watch localItem', newValue, oldv)
    },
    visible(newValue, oldv) {
      console.log('watch visible', newValue, oldv)
      if (newValue === oldv) return
      this.localVisible1 = newValue && this.step == 1
      this.localVisible2 = newValue && this.step == 2
      this.localVisible3 = newValue && this.step == 3
      if (newValue) {
        this.$store.dispatch('refresh')
      }
    },
    item(newValue, oldv) {
      console.log('watch item', newValue, oldv)
      if (newValue === oldv) return
      if (this.item.type !== 'CT') {
        this.localItem = newValue
      }
    },
    step(newValue, oldv) {
      console.log('watch step', newValue, oldv)
      if (newValue === oldv) return
      this.localVisible1 = this.visible && newValue == 1
      this.localVisible2 = this.visible && newValue == 2
      this.localVisible3 = this.visible && newValue == 3
    }
  },
  mounted() {
    this.localVisible1 = this.visible && this.step == 1
    console.log(this.balance)
    console.log(this.xctBalance)
    this.items[0].balance = this.balance + ''
    this.items[1].balance = this.xctBalance + ''
    if (this.item.type !== 'CT') {
      this.localItem = this.item
      this.localItem.contractAddress = this.item.token.address
    }
  },
  methods: {

    parseAmount() {
      if (!this.localItem.decimals) {
        return this.amount
      }
      else {
        return ethers.utils.parseUnits(this.amount, this.localItem.decimals)
      }
    },
    async gasCalc() {
      this.gas = await this.easGasSend()
      if (this.gas !== 'err') {
        this.goto(2)
      }
      else {
        this.loading = false
      }
    },
    cancel() {
      this.reset()
      switch (this.localItem.type) {
      case 'ERC-20':
        this.close('erc20')
        break
      case 'ERC-721':
      case 'ERC-1155':
        this.close('nft')
        break
      default:
        this.close()
        break
      }
    },
    async checkPassword() {
      if (await storage.comparePassword(this.password)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = '密码错误.'
        return false
      }
    },
    goto(step) {
      this.step = step
    },
    async readySend() {
      // validate only step 1
      const {valid, errors} = await this.$refs.myForm.validate()
      if (!valid) return

      // 这里计算gas
      this.gasCalc()

    },
    reset() {
      this.goto(1)

      this.recipient = ''
      this.amount = ''

      this.memo = ''
      this.password = ''
      this.passwordError = ''

      this.completedTx = null
      this.submitError = ''
    },
    async easGasSend() {
      // 转账为固定手续费
      let gasLimit = 21000
      const gasPrice = 4500
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      let override = {}
      this.loading = true
      switch (this.localItem.type) {
      case 'ERC-20':
        override = {
          from: this.address,
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9
        }
        gasLimit = await contract_gas_call_override(
          ethers,
          this.localItem.contractAddress,
          ABI_const['JiFenToken'].abi,
          'transfer',
          customHttpProvider,
          [this.recipient, this.parseAmount()],
          override
        )
        if (gasLimit.err != null) {
          console.log('error:', gasLimit.err)
        }
        gasLimit = gasLimit.data.toString()
        this.loading = false
        return gasPrice * gasLimit / 1e9
      case 'ERC-721':

        override = {
          from: this.address,
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9
        }

        if (!this.localItem.token_id) {
          this.$message.error('TokenId 为空!')
          return 'err'
        }
        gasLimit = await contract_gas_call_override(
          ethers,
          this.localItem.contractAddress,
          ABI_const['ERC721Ctnft'].abi,
          'safeTransferFrom(address,address,uint256)',
          customHttpProvider,
          [this.address, this.recipient, this.localItem.token_id],
          override
        )


        this.loading = false
        if (gasLimit.err != null) {
          console.log('error:', gasLimit.err)
          this.$message.error(gasLimit.err)
          return 'err'
        }
        else {
          gasLimit = gasLimit.data.toString()
          return gasPrice * gasLimit / 1e9
        }
      case 'ERC-1155':
        override = {
          from: this.address,
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9
        }
        if (!this.localItem.token_id) {
          this.$message.error('TokenId 为空!')
          return 'err'
        }
        gasLimit = await contract_gas_call_override(
          ethers,
          this.localItem.contractAddress,
          ABI_const['ERC1155Ctnft'].abi,
          'safeTransferFrom',
          customHttpProvider,
          [this.address, this.recipient, this.localItem.token_id, this.parseAmount(), '0x'],
          override
        )
        this.loading = false
        if (gasLimit.err != null) {
          console.log('error:', gasLimit.err)
          this.$message.error(gasLimit.err)
          return 'err'
        }
        else {
          gasLimit = gasLimit.data.toString()
          return gasPrice * gasLimit / 1e9
        }
      case 'CT':
      default:
        this.loading = false
        return gasPrice * gasLimit / 1e9
      }

    },
    async send() {
      this.passwordError = ''
      const {valid, errors} = await this.$refs.myForm1.validate()
      if (!valid) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)
      const customHttpProvider = new ethers.providers.JsonRpcProvider(this.$store.state.config.blockchain.baseURL, {
        chainId: 27
      })
      const wallet = new ethers.Wallet(privateKey, customHttpProvider)
      // create tx

      let tx
      let override
      this.loading = true
      switch (this.localItem.type) {

      case 'ERC-20':
        override = {
          from: this.address,
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.localItem.contractAddress,
          ABI_const['JiFenToken'].abi,
          'transfer',
          customHttpProvider,
          [this.recipient, this.parseAmount()],
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          const recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          // console.log('recept', recept)
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.loading = false
            this.submitError = recept.err
          }

        } catch (e) {
          console.error(e)
          this.loading = false
          this.submitError = e.message
        }

        break
      case 'ERC-721':
        override = {
          from: this.address,
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.localItem.contractAddress,
          ABI_const['ERC721Ctnft'].abi,
          'safeTransferFrom(address,address,uint256)',
          customHttpProvider,
          [this.address, this.recipient, this.localItem.token_id],
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          const recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          // console.log('recept', recept)
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.submitError = recept.err
          }

        } catch (e) {
          console.error(e)
          this.submitError = e.message
        }
        break
      case 'ERC-1155':
        override = {
          from: this.address,
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9
        }
        tx = await contract_call_override(
          ethers,
          wallet,
          this.localItem.contractAddress,
          ABI_const['ERC1155Ctnft'].abi,
          'safeTransferFrom',
          customHttpProvider,
          [this.address, this.recipient, this.localItem.token_id, this.parseAmount(), '0x'],
          override
        )

        console.log('tx:', tx)
        if (tx.data == null) {
          console.log('发生错误')
          this.submitError = tx.err
          this.loading = false
          return
        }
        try {
          const recept = await customHttpProvider
            .waitForTransaction(tx.data.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          // console.log('recept', recept)
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = tx.data
            this.goto(3)
          }
          else {
            this.submitError = recept.err
          }

        } catch (e) {
          console.error(e)
          this.submitError = e.message
        }
        break
      case 'CT':
      default:
        const memo = Buffer.from(this.memo, 'utf8').toString('hex')
        tx = {
          from: this.address,
          to: this.recipient,
          // ... or supports ENS names
          // to: "ricmoo.firefly.eth"
          // We must pass in the amount as wei (1 ether = 1e18 wei), so we
          // use this convenience function to convert ether to wei.
          // gasPrice: ethers.utils.hexlify(0),
          maxPriorityFeePerGas: 4500e9,
          maxFeePerGas: 4800e9,
          value: ethers.utils.parseEther((this.amountParsedCalc).toString()),
          data: '0x' + memo,
          nonce: this.nextNonce
        }

        // submit tx to blockchain
        try {

          const results = await wallet.sendTransaction(tx)

          const recept = await customHttpProvider
            .waitForTransaction(results.hash)
            .then((ret) => ret)
            .catch((err) => {
              console.log('err:', err)
            })
          this.loading = false
          if (recept.status === TRANSACTION_RECEIPT_STATUS.REVERTED) {
            throw 'Transaction Reverted'
          }
          if (recept.status === TRANSACTION_RECEIPT_STATUS.SUCCESS) {
            this.completedTx = results
            this.goto(3)
          }
          else {
            this.submitError = results[0].reason
          }
        } catch (err) {
          console.error(err)
          this.loading = false
          this.submitError = err.message
        }
      }


    },
    sendOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.send()
    },
    setAmountAsPercent(pct) {
      switch (this.localItem.type) {
      case 'ERC-20':
        this.amount = (Math.floor(this.formattedAmount * 1e6) / 1e6).toFixed(6)
        break
      case 'ERC-721':
      case 'ERC-1155':
        this.amount = (Math.floor(this.localItem.balance * 1e6) / 1e6).toFixed(6)
        break
      default:
        this.amount = (Math.floor(this.balance * 1e6) / 1e6).toFixed(6)
      }
    }
  },
  setup() {
    return {
      LockOpenIcon, EyeIcon, EyeOffIcon
    }
  }
}
</script>

<style scoped>
</style>
