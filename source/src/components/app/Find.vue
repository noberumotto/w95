<template>
  <div class="app-container find" ref="find">
    <context-menu
      :data="menubar_contextmenu"
      ref="menubar_contextmenu"
      @click="menuBarClick"
    />
    <div class="menu-bar">
      <div class="item" v-on:click="showmenu($event, 0)">
        文件(<label>F</label>)
      </div>
      <!-- <div class="item" v-on:click="showmenu($event, 3)">
        帮助(<label>H</label>)
      </div> -->
    </div>
    <hr />
    <div class="filter-container">
      <div class="filter bg-gray">
        <div class="pheader">
          <div class="item bg-gray">名称和位置</div>
        </div>
        <div class="details mainoutborder">
          <div class="item">
            <div class="propertie">名称</div>
            <div class="value">
              <input type="text" v-model="name" class="inputbox" />
            </div>
          </div>
          <div class="item">
            <div class="propertie">位置</div>
            <div class="value">
              <select class="inputbox" v-show="false">
                <option>12</option>
              </select>
              <input type="text" class="inputbox" v-model="location" />
              <btn v-on:click.native="browse" :width="60">浏览...</btn>
            </div>
          </div>
          <div class="item">
            <div class="propertie"></div>
            <div class="value">
              <input
                id="checkbox"
                type="checkbox"
                v-model="includeSubfolders"
                v-show="false"
              />
              <label class="mainborder" for="checkbox"></label>包含子文件夹
            </div>
          </div>
        </div>
      </div>
      <div class="btns">
        <btn :width="80" @click.native="search()">搜索</btn>
      </div>
    </div>
    <div class="window-border">
      <div class="app-main">
        <div class="container">
          <div class="table-header">
            <div class="item">名称</div>
            <div class="item">位置</div>
            <div class="item">大小</div>
            <div class="item">类型</div>
            <div class="item">修改日期</div>
            <div class="item">1</div>
          </div>
          <div class="list">
            <div
              :class="{
                selected: selectedItem == item,
              }"
              class="item"
              v-for="(item, index) in list"
              :key="index"
            >
              <div class="value" @click="select(item)" @dblclick="open(item)">
                <img
                  :src="
                    require('../../assets/' + getTypeIcon(item.type) + '.png')
                  "
                />
                <label> {{ item.name }}</label>
              </div>
              <div class="value">
                {{ item.args.location }}
              </div>
              <div class="value" style="text-align: right">
                {{ convertSize(item.args.size) }}
              </div>
              <div class="value">
                {{ convertTypeToString(item.type) }}
              </div>
              <div class="value">{{ convertTime(item.args.updateTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContextMenu from "../ContextMenu.vue";
import Shortcut from "../Shortcut.vue";
import { mapState } from "vuex";
import Btn from "../Btn.vue";
import size from "../../library/size";
import time from "../../library/time";
import app from "../../library/app";

export default {
  components: { Shortcut, ContextMenu, Btn },
  name: "Find",
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
      location: "",
      name: "",
      list: [],
      files: [],
      selectedItem: null,
      includeSubfolders: true,
    };
  },
  mounted() {
    this.files = require("@/data/files.json");
  },
  methods: {
    open(item) {
      app.run({
        app: item.app,
        args: item.args,
      });
    },
    select(item) {
      this.selectedItem = item;
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
    getTypeIcon(type) {
      switch (type) {
        case "photo":
          return "photos";
        case "txt":
          return "txt";
        case "word":
          return "word";
      }
    },
    search() {
      var list = [];
      this.files.forEach((item) => {
        if (
          (this.includeSubfolders &&
            item.name.indexOf(this.name) != -1 &&
            item.args.location.indexOf(this.location) != -1) ||
          (!this.includeSubfolders &&
            item.name.indexOf(this.name) != -1 &&
            item.args.location === this.location)
        ) {
          list.push(item);
        }
      });

      this.list = list;
    },
    browse() {
      this.$folderdialog({
        content: "选择要开始搜索的文件夹",
        confirm: (folder) => {
          this.location = folder.args.location;
          console.log(folder);
        },
      });
    },
    menuBarClick(item) {
      switch (item.command) {
        case "exit":
          this.exit();
          break;
        case "open":
          this.open(this.selectedItem);
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
            title: "打开",
            type: "menu",
            disabled: !this.selectedItem,
            command: "open",
          });
          this.menubar_contextmenu.push({
            type: "line",
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
hr {
  margin: 0;
}
.app-main {
  position: relative;
}
.container {
  position: absolute;
  // background: green;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  .list {
    flex: 1;
    overflow: scroll;
    .selected {
      .value:first-child {
        img {
          filter: contrast(25%);
        }
        label {
          background: #0000a8;
          color: #fff;
          border: 1px dotted #fff !important;
        }
      }
    }
    .item {
      display: flex;
      align-items: center;

      .value {
        padding: 2px 4px;
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .value:first-child {
        display: flex;
        align-items: center;
        label {
          border: 1px solid transparent;
        }
        img {
          width: 16px;
          margin-right: 3px;
        }
      }
    }
  }
  .table-header {
    display: flex;
    align-items: center;
    // margin: 1px;
    border: 1px solid #87888f;
    // border-bottom: none;
    // margin-right: 1px;
    // padding-right: 20px;
    background: #c0c7c8;

    .item {
      // box-shadow:inset 2px 2px 0 0 black;
      border: 1px solid #ffffff;
      border-right-color: #000;
      border-bottom-color: #000;
      // background: #c0c7c8;
      padding: 2px 0;
      padding-left: 5px;
      flex: 1;
    }
    .item:active {
      border: 1px solid #000;
      border-right-color: #fff;
      border-bottom-color: #fff;
    }
    .item:last-child {
      flex: unset;
      color: #c0c7c8;
      width: 20px !important;
    }
  }
}
.filter-container {
  display: flex;
  .btns {
    margin: 30px 10px;
    margin-left: 0px;
  }
  .filter {
    flex: 1;
    // background: red;
    padding: 10px;
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
          display: flex;
          align-items: center;
          label {
            display: inline-block;
            width: 18px;
            height: 18px;
            background: white;
            position: relative;
            cursor: pointer;
            margin-right: 5px;
          }
          label::before {
            display: inline-block;
            content: " ";
            width: 8px;
            border: 2px solid #000;
            height: 4px;
            border-top: none;
            border-right: none;
            transform: rotate(-45deg);
            top: 5px;
            left: 3px;
            position: absolute;
            opacity: 0;
          }
          input:checked + label {
            // background: #2eb5f0;
          }
          input:checked + label::before {
            opacity: 1;
            transform: all 0.5s;
          }

          .btn {
            margin-left: 10px;
          }
        }
      }
    }
  }
}
</style>
