<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Unlock Stake<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-14">
            <label>Stake ID</label>
            <HashLink to="explorer" :stake="stake.id" truncated />
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>Stake amount</label>
            <Amount :value="stakeAmountParsed" currency="CT" short sub/>
          </div>
          <div class="mb-16 form-group text-3xl">
            <label>Unlock period</label>
            <span class="break-all">{{ unlockPeriodInDays }}</span><span class="text-lg"> days</span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
              <label for="pass-step">输入密码</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  type="password"
                  autocomplete="off"
                  @keypress="unlockOnEnter"
                  placeholder="你的密码"
                  id="pass-step"
                  v-model="v$.password.$model"
                />
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">返回</button>
            <button
              :disabled="!canUnlock"
              @click="unlock"
              class="w-full button button--success"
            >Unlock Stake</button>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div v-if="submitError" class="px-20 py-20 my-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ submitError }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Unlock requested<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Amount</label>
            <Amount :value="stakeAmountParsed" currency="CT" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Fee</label>
            <Amount :value="0" currency="CT" short sub/>
          </div>
          <div class="form-group mb-14">
            <label>交易哈希</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated />
          </div>
          <div class="flex items-center mt-24 leading-8 text-gray">
            <!-- eslint-disable-next-line max-len -->
            <p class="mb-0">您的交易已提交。交易确认后，您的股份将开始解锁。它将解锁 {{ unlocksAtDate }} at {{ unlocksAtTime }}。</p>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <button
            @click="cancel"
            class="block w-full mx-auto text-center button button--success md:w-1/2"
          >关闭</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
/*global process*/

import * as storage from '@/utils/storage'
import * as validation from '@/utils/validation'
import * as xe from '@edge/xe-utils'
import Amount from '../Amount'
import HashLink from '../HashLink'
import { LockOpenIcon } from '@heroicons/vue/outline'
import Modal from '../Modal'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'UnlockStakeModal',
  components: {
    Amount,
    HashLink,
    LockOpenIcon,
    Modal
  },
  props: {
    close: Function,
    stake: Object,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      password: '',
      passwordError: '',

      completedTx: null,
      submitError: ''
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'nextNonce']),
    canUnlock() {
      return !this.v$.$invalid
    },
    completedTxShortHash() {
      if (this.completedTx === null) return ''
      return [
        this.completedTx.hash.substring(0, 6),
        this.completedTx.hash.substring(this.completedTx.hash.length - 4)
      ].join('...')
    },
    stakeAmountParsed() {
      return this.stake.amount / 1e6
    },
    stakeShortId() {
      if (this.stake === null) return ''
      return [
        this.stake.id.substring(0, 6),
        this.stake.id.substring(this.stake.id.length - 4)
      ].join('...')
    },
    stakeTypeFormatted() {
      return this.stake.type[0].toUpperCase() + this.stake.type.slice(1)
    },
    unlockPeriodInDays() {
      return this.stake.unlockPeriod / 1000 / 3600 / 24
    },
    unlocksAt() {
      if (this.stake) return this.completedTx.timestamp + this.stake.unlockPeriod
      else return null
    },
    unlocksAtDate() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[0]
    },
    unlocksAtTime() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[1]
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    async checkPassword() {
      this.v$.password.$reset()
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
    reset() {
      this.goto(1)

      this.password = ''
      this.passwordError = ''
      this.submitError = ''
      this.completedTx = undefined

      this.v$.$reset()
    },
    async unlock() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)

      // create tx
      const tx = xe.tx.sign({
        timestamp: Date.now(),
        sender: this.address,
        recipient: this.address,
        amount: 0,
        data: {
          action: 'unlock_stake',
          memo: 'Unlock Stake',
          stake: this.stake.hash
        },
        nonce: this.nextNonce
      }, privateKey)

      // submit tx to blockchain
      try {
        const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
        if (metadata.accepted) {
          this.completedTx = results[0]
          this.goto(2)
        }
        else {
          this.submitError = results[0].reason
        }
      }
      catch (err) {
        console.error(err)
        this.submitError = err.message
      }
    },
    unlockOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.unlock()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    }
  }
}
</script>

<style scoped>
.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.amount.sub {
  @apply text-white text-3xl;
}

.amount.sub :deep(.currency) {
  @apply text-half bottom-0 ml-2;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
