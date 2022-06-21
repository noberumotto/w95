<template>
  <div class="flolderdialog" v-if="isShow">
    <window
      :title="'浏览文件夹'"
      ref="window"
      :closeBtn="true"
      :width="300"
      :iscenter="true"
      :isDialog="true"
    >
      <div class="content-container">
        <div class="content">
          <div class="tip">{{ content }}</div>
        </div>
        <div class="folders mainborder">
          <folder-item
            v-for="item in data"
            :key="item.name"
            :data="item"
            v-on:selected="selected"
          />
        </div>
        <div class="btns right">
          <btn
            :class="{
              disabled: !this.selectedItem,
            }"
            v-on:click.native="done()"
            :width="80"
            :height="22"
            >确定</btn
          >
          <btn v-on:click.native="done('cancel')" :width="80" :height="22"
            >取消</btn
          >
        </div>
      </div>
    </window>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Btn from "../Btn.vue";

import Window from "../Window.vue";
import FolderItem from "./FolderItem.vue";
export default {
  components: { Window, Btn, FolderItem },
  name: "Flolderdialog",
  props: {
    content: String,
    confirm: Function,
    cancel: Function,
  },
  data() {
    return {
      isShow: false,
      data: [],
      selectedItem: null,
    };
  },
  computed: {
    ...mapState(["client"]),
  },
  mounted() {
    var diskData = require("@/data/data.json");

    diskData.forEach((item) => {
      this.map(item);
    });
    // var data = JSON.stringify(diskData);

    this.data = diskData;

    console.log(diskData);
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
    done(action) {
      if (action == "cancel") {
        if (this.cancel) {
          this.cancel();
        }
      } else {
        if (this.confirm) {
          this.confirm(this.selectedItem);
        }
      }
      this.closeWindow();
    },
    map(data) {
      if (data.type == "disk" || data.type == "folder") {
        // data.selected = false;
        this.$set(data, "selected", false);

        data.args.data.map((item) => {
          return this.map(item);
        });
      }
      return data;
    },
    selected(item) {
      if (this.selectedItem) {
        this.selectedItem.selected = false;
      }

      this.selectedItem = item;

      item.selected = true;

      console.log(item);
    },
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
.content {
  padding: 10px;
  display: flex;
  .main {
    flex: 1;
  }
}
.folders {
  margin: 10px;
  background: white;
  height: 200px;
  overflow: scroll;
}
.btns {
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  .btn {
    margin-left: 5px;
  }
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
