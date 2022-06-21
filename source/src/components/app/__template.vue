<template>
  <div class="app-container recycle" ref="recycle">
    <context-menu
      :data="menubar_contextmenu"
      ref="menubar_contextmenu"
      @click="menuBarClick"
    />
    <div class="menu-bar">
      <div class="item" v-on:click="showmenu($event, 0)">
        文件(<label>F</label>)
      </div>
      <div class="item" v-on:click="showmenu($event, 3)">
        帮助(<label>H</label>)
      </div>
    </div>
    <div class="window-border">
      <div class="app-main"></div>
    </div>
  </div>
</template>

<script>
import ContextMenu from "../ContextMenu.vue";
import Shortcut from "../Shortcut.vue";
import { mapState } from "vuex";

export default {
  components: { Shortcut, ContextMenu },
  name: "Recycle",
  props: {
    /**
     * 进程id，每个app必有
     */
    pid: Number,
  },
  computed: {
    ...mapState(["client"]),
  },
  data() {
    return {
      menubar_contextmenu: [],
    };
  },
  mounted() {},
  methods: {
    menuBarClick(item) {
      switch (item.command) {
        case "exit":
          this.exit();
          break;
      }
    },
    showmenu(event, num) {
      let x, y;
      x = event.target.getBoundingClientRect().left;
      y = event.target.getBoundingClientRect().top;
      switch (num) {
        case 0:
          //  文件

          this.menubar_contextmenu = [];

          this.menubar_contextmenu.push({
            title: "新建(W)",
            type: "menu",
            disabled: true,
          });
          this.menubar_contextmenu.push({
            title: "删除(D)",
            type: "menu",
            disabled: true,
          });
          this.menubar_contextmenu.push({
            type: "line",
          });
          this.menubar_contextmenu.push({
            title: "关闭(C)",
            type: "menu",
            command: "exit",
          });

          break;
        case 3:
          //  帮助

          this.menubar_contextmenu = [
            {
              title: "帮助主题(H)",
              type: "menu",
              disabled: true,
            },
            {
              type: "line",
            },
            {
              title: "关于",
              type: "menu",
            },
          ];
          break;
      }
      let contextmenu = this.$refs.menubar_contextmenu;
      contextmenu.show({
        clientX: x - 4,
        clientY: y + 14,
      });
    },

    /**
     * 结束app，每个必须有
     */
    exit() {
      console.log(this.$props.pid);
      this.$store.dispatch("client/exitapp", this.$props.pid);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
