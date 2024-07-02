<template>
  <div
    class="bg-black bg-center bg-no-repeat bg-cover"
    :style="!hasWallet ? 'background-image: url(/assets/map.svg);' : ''"
  >
    <div class="container">
      <div class="relative">
        <div class="absolute left-0 top-64">
          <Logo/>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center min-h-screen py-128">
      <div class="container">
        <div class="mx-auto max-w-800">
          <div class="text-white md:px-6 mb-11 text-caption" v-if="!hasWallet">
            <h1 class="mb-2 text-white">
              欢迎到草田链
            </h1>
            <p>创建或者导入一个草田链钱包去开始</p>
          </div>

          <div
            v-if="!hasWallet"
            class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100"
            style="box-shadow: 0px 0px 100px 50px #000000"
          >
            <div>
              <h3 class="mb-18 text-gray">创建一个新的钱包</h3>
              <button class="w-full button button--success" @click="openCreateModal">
                创建钱包
              </button>
              <CreateModal :afterCreate="gotoOverview" :close="reset" :visible="modal === 'create'"/>
            </div>
            <div>
              <h3 class="mb-18 text-gray">导入一个已存在的钱包</h3>
              <button class="w-full button button--outline-success" @click="openRestoreModal">
                导入钱包
              </button>
              <RestoreModal :afterRestore="gotoOverview" :close="reset" :visible="modal === 'restore'"/>
            </div>
          </div>

          <div>
            <UnlockModal
              :afterUnlock="gotoOverview"
              :close="resetAuto"
              :switchToForgetModal="openForgetModal"
              :visible="modal === 'unlock'"
            />
            <ForgetModal :afterForget="reset" :close="resetAuto" :visible="modal === 'forget'"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateModal from '@/components/index/CreateModal'
import ForgetModal from '@/components/index/ForgetModal'
import RestoreModal from '@/components/index/RestoreModal'
import UnlockModal from '@/components/index/UnlockModal'
import Logo from '@/components/Logo'
import {fetchCardlist} from '@/utils/api'
import {mapState} from 'vuex'

export default {
  name: 'ViewIndex',
  title: '创建或导入钱包',
  components: {
    CreateModal,
    ForgetModal,
    Logo,
    RestoreModal,
    UnlockModal
  },
  data: function () {
    return {
      modal: ''
    }
  },
  computed: mapState({
    address: 'address',
    locked: 'locked',
    hasWallet: state => state.address.length > 0
  }),
  methods: {
    gotoOverview() {
      if(this.modal != 'unlock') {
        sessionStorage.setItem('needAuth', 1)
      }

      this.$router.push('overview')
    },
    openCreateModal() {
      this.modal = 'create'
    },
    openForgetModal() {
      this.modal = 'forget'
    },
    openRestoreModal() {
      this.modal = 'restore'
    },
    openUnlockModal() {
      this.modal = 'unlock'
    },
    reset() {
      this.modal = ''
    },
    resetAuto() {
      if (this.hasWallet) this.modal = 'unlock'
      else this.modal = ''
    }
  },
  mounted() {
    if (!this.locked) this.$router.replace('overview')
    else this.resetAuto()
  }
}
</script>
