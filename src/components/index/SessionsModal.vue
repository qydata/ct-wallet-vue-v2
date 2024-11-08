<template>
  <Modal :visible="visible">
    <template v-slot:header>
      <h2>Session 管理</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <div class="form-group">
          <Sessions/>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="grid grid-cols-1 gap-24 p-20 ">
        <el-button type="primary" size="large" @click="close">关闭
        </el-button>
      </div>
    </template>
  </Modal>
</template>

<script>
import {mapState} from 'vuex'
import Modal from '../Modal'
import Sessions from '../modal/Sessions.vue'

export default {
  name: 'AuthBindModal',
  components: {
    Sessions,
    Modal
  },
  props: {
    afterAuthBind: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {}
  },

  computed: {
    ...mapState(['address'])
  },
  methods: {},
  async mounted() {
  },
  setup() {
  }
}
</script>

<style scoped>
.private-key {
  width: 32ch
}

.on-clicked-effect {
  transition: all 0.4s ease-in;
}

.on-clicked-effect:before {
  content: '';
  background-color: aliceblue;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.on-clicked-effect:focus:not(:active) {
  position: relative;
  display: inline-block;
  outline: 0;
}

.on-clicked-effect:focus:not(:active):before {
  animation: clicked_animation 0.8s ease-out;
}

@keyframes clicked_animation {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}
</style>
