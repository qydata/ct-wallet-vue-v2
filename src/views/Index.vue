<template>
  <v-container
    class="bg-black bg-center bg-no-repeat bg-cover"
    :style="!hasWallet ? 'background-image: url(/assets/map.svg);' : ''"
  >
    <div class="flex items-center justify-center min-h-screen">
      <div class=" max-w-800">
        <div class="text-white md:px-6 mb-11 text-caption" v-if="!hasWallet">
          <v-card-item title="欢迎到草田链" subtitle="创建或者导入一个草田链钱包去开始">
            <template v-slot:prepend>
              <Logo/>
            </template>
          </v-card-item>
        </div>

        <v-row
          v-if="!hasWallet"
        >
          <v-col cols="12" md="6">
            <v-card title="创建" subtitle="创建一个新的钱包">
              <template v-slot:append>
                <v-btn size="large" @click="openCreateModal">
                  创建钱包
                </v-btn>
              </template>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card title="导入" subtitle="导入一个已存在的钱包">
              <template v-slot:append>
                <v-btn size="large" @click="openRestoreModal">导入钱包</v-btn>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
    <UnlockModal
      :afterUnlock="gotoOverview"
      :close="resetAuto"
      :switchToForgetModal="openForgetModal"
      :visible="true" v-if="modal === 'unlock'"
    />
    <ForgetModal :afterForget="reset" :close="resetAuto" :visible="true" v-if="modal === 'forget'"/>
    <RestoreModal :afterRestore="gotoOverview" :close="reset" :visible="true" v-if="modal === 'restore'"/>
    <CreateModal :afterCreate="gotoOverview" :close="reset" :visible="true" v-if="modal === 'create'"/>
  </v-container>
</template>

<script>
import CreateModal from '@/components/index/CreateModal'
import ForgetModal from '@/components/index/ForgetModal'
import RestoreModal from '@/components/index/RestoreModal'
import UnlockModal from '@/components/index/UnlockModal'
import Logo from '@/components/Logo'
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
    hasWallet: state => state.address && state.address.length > 0
  }),
  methods: {
    gotoOverview() {
      if (this.modal != 'unlock') {
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
