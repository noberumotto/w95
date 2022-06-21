<template>
  <div class="messagebox" v-if="isShow">
    <window
      :title="title"
      ref="window"
      :closeBtn="true"
      :width="300"
      :iscenter="true"
      :isDialog="true"
    >
      <div class="content-container">
        <div class="content">
          <div class="icon" v-if="icon && icon != ''">
            <img :src="require('../../assets/' + icon + '.png')" />
          </div>
          <!-- <p>{{ content }}</p> -->
          <div class="main" v-html="content"></div>
        </div>
        <div
          class="btns"
          :class="{
            center: btnalgin == 'center',
            left: btnalgin == 'left',
            right: btnalgin == 'right',
          }"
        >
          <btn v-on:click.native="closeWindow" :width="80" :height="22">OK</btn>
        </div>
      </div>
    </window>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Btn from "../Btn.vue";

import Window from "../Window.vue";
export default {
  components: { Window, Btn },
  name: "Messagebox",
  props: {
    icon: String,
    title: String,
    content: String,
    btnalgin: {
      type: String,
      default: "center",
    },
  },
  data() {
    return {
      isShow: false,
    };
  },
  computed: {
    ...mapState(["client"]),
  },
  mounted() {
    this.isShow = true;
    this.$nextTick(() => {
      this.$refs.window.show().then((btn) => {
        this.hide();
      });
      var focus = setTimeout(() => {
        clearTimeout(focus);
        this.$refs.window.click();
      }, 20);
    });
  },
  methods: {
    closeWindow() {
      this.$refs.window.hide();
      this.hide();
    },
    hide() {
      if (!this.isShow) {
        return;
      }
      this.isShow = false;
      this.remove();
    },
  },
};
</script>

<style lang="scss" scoped>
.messagebox {
  /* z-index: 50; */
}
.content {
  padding: 10px;
  display: flex;
  .main {
    flex: 1;
  }
}

.btns {
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.center {
  justify-content: center;
}
.left {
  justify-content: flex-start;
}
.right {
  justify-content: flex-end;
}
</style>
