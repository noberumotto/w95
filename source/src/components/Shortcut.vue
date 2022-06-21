<template>
  <div class="shortcut-container">
    <window
      :title="name + ' 属性'"
      :width="360"
      :height="420"
      :closeBtn="true"
      :minBtn="false"
      ref="propertiesWindow"
      :iscenter="true"
      v-if="isShowProperties"
    >
      <div class="properties">
        <div class="content">
          <div class="pheader">
            <div class="item bg-gray">常规</div>
          </div>
          <div class="details mainoutborder">
            <div class="item">
              <div class="propertie">
                <img
                  class="shortcut_"
                  :src="require('../assets/' + img + '.png')"
                />
              </div>
              <div class="value">{{ name }}</div>
            </div>
            <hr />
            <div class="item">
              <div class="propertie">类型</div>
              <div class="value">{{ convertTypeToString(type) }}</div>
            </div>
            <div class="item">
              <div class="propertie">位置</div>
              <div class="value">{{ args.location }}</div>
            </div>
            <div class="item">
              <div class="propertie">大小</div>
              <div class="value">{{ convertSize(args.size) }}</div>
            </div>
            <hr />
            <div class="item">
              <div class="propertie">创建时间</div>
              <div class="value">{{ convertTime(args.createTime) }}</div>
            </div>
            <div class="item">
              <div class="propertie">修改时间</div>
              <div class="value">{{ convertTime(args.updateTime) }}</div>
            </div>
          </div>
        </div>
        <div class="btns">
          <btn :width="80" v-on:click.native="closePropertiesWindow()"
            >确定</btn
          >
        </div>
      </div>
    </window>
    <div
      class="shortcut"
      :class="{ selected: selected, row: styleType == 'row' }"
      v-on:dblclick="onDbclick"
      @mousedown="mousedown"
      @click="mousedown"
    >
      <context-menu ref="menu" :data="menuData" @click="menuClick" />
      <div class="tooltip">{{ name }}</div>
      <div class="grid">
        <div class="icon shortcut_" v-if="img && img != ''">
          <img class="shortcut_" :src="require('../assets/' + img + '.png')" />
        </div>
        <div
          class="name shortcut_"
          v-bind:style="{
            color: color ? color : '#ffffff',
            overflow: rename ? 'unset' : 'hidden',
          }"
        >
          <textarea
            ref="inputbox"
            v-model="fileName"
            v-if="rename"
            @mousedown.stop=""
            @click.stop=""
            @blur.prevent="renamedone()"
          ></textarea>
          {{
            rename
              ? ""
              : styleType == "col" && name.length > 15
              ? name.substring(0, 5) + "..."
              : name
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ContextMenu from "./ContextMenu.vue";
import time from "../library/time";
import sizeFormater from "../library/size";
import Window from "./Window.vue";
import Btn from "./Btn.vue";
import size from "../library/size";

export default {
  name: "Shortcut",
  components: { ContextMenu, Window, Btn },
  props: {
    id: Number,
    index: Number,
    icon: String,
    name: String,
    selected: Boolean,
    type: String,
    app: String,
    color: String,
    args: Object,
    shortcutData: Object,
    styleType: {
      type: String,
      default: "col", //col,row,
    },
  },
  data() {
    return {
      img: "",
      menuData: [],
      fileName: "",
      rename: false,
      isShowProperties: false,
    };
  },
  watch: {
    icon: function (val) {
      this.img = val;
    },
  },
  computed: {
    ...mapState(["client"]),
  },
  mounted: function () {
    this.fileName = this.name;
    if (this.$props.type) {
      switch (this.$props.type) {
        case "disk":
          this.img = "disk";
          break;
        case "txt":
          this.img = "txt";
          break;
        case "word":
          this.img = "word";
          break;
        case "photo":
          this.img = "photos";
          if (this.$props.args) {
            let file = this.$props.args.data;
            if (file) {
              if (
                file.indexOf("http://") != -1 ||
                file.indexOf("https://") != -1 ||
                file.indexOf(".webimg") != -1
              ) {
                this.img = "webphoto";
              }
            }
          }
          break;
        case "folder":
          this.img = "folder";
          break;
        default:
          this.img = this.$props.icon;
      }
    } else {
      this.img = this.$props.icon;
    }

    let item = this;
    this.$nextTick(function () {
      // 仅在整个视图都被渲染之后才会运行的代码
      this.$emit("loaded", this);
    });

    window.onmouseup = function () {
      item.$emit("loaded", item);
    };
    this.createMenu();
  },
  methods: {
    convertTypeToString(type) {
      switch (type) {
        case "photo":
          return "图像";
        case "txt":
          return "文本文档";
        case "word":
          return "写字板文档";
        case "folder":
          return "文件夹";
        case "disk":
          return "本地磁盘";
      }
    },
    convertSize(val) {
      if (val >= 0) {
        return size.toString(val);
      }
      return "";
    },
    convertTime(val) {
      if (!val) {
        return "";
      }
      return time.toString(val);
    },
    closePropertiesWindow() {
      this.isShowProperties = false;
      this.$refs.propertiesWindow.close();
    },
    renamedone() {
      this.rename = false;

      if (this.fileName == "") {
        this.fileName = this.name;
        return;
      }

      var list = this.$store.state.client.shrotcutList;

      var shortcut = list.find((item) => item.id == this.shortcutData.id);

      if (shortcut) {
        shortcut.name = this.fileName;
        shortcut.args.subtitle = this.fileName;
        this.$store.dispatch("client/updateShrotcutList", list);
      }
    },
    createMenu() {
      var menu = [];
      switch (this.$props.type) {
        case "txt":
        case "photo":
        case "word":
          menu.push({
            title: "打开",
            type: "menu",
            command: "open",
          });
          menu.push({
            disabled: true,
            title: "打印",
            type: "menu",
          });
          menu.push({
            type: "line",
          });
          menu.push({
            disabled: true,
            title: "发送到",
            type: "menu",
          });
          menu.push({
            type: "line",
          });
          menu.push({
            disabled: true,
            title: "剪切",
            type: "menu",
          });
          menu.push({
            disabled: true,
            title: "复制",
            type: "menu",
          });
          menu.push({
            type: "line",
          });
          menu.push({
            disabled: true,
            title: "创建快捷方式",
            type: "menu",
          });
          menu.push({
            title: "删除",
            type: "menu",
            command: "delete",
            disabled: !this.shortcutData,
          });
          menu.push({
            title: "重命名",
            type: "menu",
            command: "rename",
            disabled: !this.shortcutData,
          });
          menu.push({
            type: "line",
          });
          menu.push({
            // disabled: true,
            title: "属性",
            type: "menu",
            command: "properties",
          });
          break;
      }

      this.menuData = menu;
    },
    mousedown(e) {
      if (e.button == 2) {
        if (this.menuData.length > 0) {
          this.$refs.menu.show(e);
        }
      }

      this.$emit("tap", this.$props);
    },
    menuClick(item) {
      switch (item.command) {
        case "delete":
          if (this.isRuning()) {
            this.$msgbox({
              title: "提示",
              icon: "error",
              content: "文件打开中",
            });

            return;
          }
          this.remove();
          break;
        case "open":
          this.open();
          break;
        case "rename":
          this.rename = true;
          this.$nextTick(() => {
            this.$refs.inputbox.focus();
          });
          break;
        case "properties":
          this.isShowProperties = true;
          this.$nextTick(() => {
            this.$refs.propertiesWindow.show().then(() => {
              this.isShowProperties = false;
            });
          });
          break;
      }
    },
    showProperties() {},
    remove() {
      this.toRecycle(this.shortcutData);

      var list = this.$store.state.client.shrotcutList;
      const isHas = (element) => element.id == this.shortcutData.id;

      var index = list.findIndex(isHas);

      if (index != -1) {
        list.splice(index, 1);
        this.$store.dispatch("client/set", {
          shrotcutList: list,
        });
      }
    },
    onDbclick() {
      this.$emit("dbtap", this.$props);
      this.open();
      // console.log(this.$props.app);
    },
    isRuning() {
      let runAppList = this.$store.state.client.runAppList;

      let app = runAppList.find((item) => {
        if (JSON.stringify(item.args) == JSON.stringify(this.$props.args)) {
          return item;
        }
      });

      return app;
    },
    open() {
      if (this.$props.app != "") {
        let runAppList = this.$store.state.client.runAppList;

        if (runAppList && runAppList.length >= 13) {
          this.$msgbox({
            title: "提示",
            icon: "error",
            content: "内存不足！",
          });
          return;
        }
        var app = this.isRuning();
        if (app) {
          app.window.click();
        } else {
          runAppList.push({
            pid: this.generatePid(),
            name: this.$props.app,
            title: this.name,
            active: true,
            icon: this.$props.type == "folder" ? "folder_open" : this.img,
            args: this.$props.args,
            shortcutData: this.$props.shortcutData,
            instance: {},
            window: {},
          });

          this.$store.dispatch("client/set", {
            runAppList: runAppList,
          });
        }
      }
    },
    generatePid() {
      let runAppList = this.client.runAppList;
      let maxPid = 0;
      runAppList.forEach((element) => {
        maxPid = element.pid > maxPid ? element.pid : maxPid;
      });
      return maxPid + 1;
    },
    toRecycle(shortcut) {
      var list = this.$store.state.client.recycleList;
      if (!list) {
        list = [];
      }

      var size = 0;
      switch (shortcut.type) {
        case "txt":
          size = shortcut.args.content.length;
          break;
      }

      size = sizeFormater.toString(size);

      var delData = {
        icon: shortcut.icon,
        name: shortcut.name,
        location: "C:\\WINDOWS\\DESKTOP",
        deldate: time.toString(),
        type: shortcut.type,
        size: size,
        data: shortcut,
        isselected: false,
      };

      list.push(delData);

      this.$store.dispatch("client/updateRecycleList", list);
    },
  },
};
</script>

<style lang="scss" scoped>
.properties {
  padding: 5px;
  // background: #ffffd5;
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    // background: red;
    display: flex;
    flex-direction: column;
    .pheader {
      display: flex;
      z-index: 1;
      .item {
        padding: 3px 5px;
        border: 1px solid #fff;
        border-bottom: none;
        border-radius: 3px;
        border-right: 2px solid #000;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
    .details {
      flex: 1;
      padding: 12px;
      margin-top: -1px;
      .item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        img {
          width: 30px;
        }
        .propertie {
          width: 20%;
        }
        .value {
          // background: red;
          width: 80%;
          word-break: break-all;
        }
      }
    }
  }
  .btns {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
.shortcut:hover .tooltip {
  // visibility: visible;
  // opacity: 1;
  animation: tooltip 3s forwards;
}
@keyframes tooltip {
  0% {
    opacity: 0;
  }
  29% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  99% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.shortcut {
  display: inline-block;
  padding: 10px;
  width: 95px;
  position: relative;
  .tooltip {
    opacity: 0;
    width: 100px;
    background-color: #ffffd5;
    color: #000;
    text-align: center;
    padding: 3px;
    border: 1px solid #000;
    box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.308);
    position: absolute;
    z-index: 1;
    top: 100%;
    word-break: break-all;
    left: 5%;
    font-size: 10px;
    /* Fade in tooltip */
    pointer-events: none;
  }
  .icon {
    img {
      width: 28px;
    }
  }
}
.row {
  width: auto;
  padding: 0;
  margin: 0 !important;
  .grid {
    display: flex;
    align-items: center;
    .icon {
      img {
        width: 15px;
      }
    }
    .name {
      margin-left: 3px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
.grid {
  text-align: center;
}
.name {
  color: white;
  border: 1px solid transparent;
  overflow: hidden;
  /* max-height: 38px;
  overflow: hidden; */
  textarea {
    z-index: 2;
    resize: none;
    max-width: 100px;
    height: auto;
  }
}
.shortcut:active .name,
.selected .name {
  border: 1px dotted white;
  background: #010083;
  color: #fff !important;
}
.shortcut:active img,
.selected img {
  filter: contrast(25%);
}
</style>
