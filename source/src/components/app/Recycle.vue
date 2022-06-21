<template>
  <div class="app-container recycle" ref="recycle">
    <context-menu
      :data="menubar_contextmenu"
      ref="menubar_contextmenu"
      @click="contextMenuClick"
    />
    <div class="menu-bar">
      <div class="item" v-on:click="showmenu($event, 0)">
        文件(<label>F</label>)
      </div>
      <!-- <div class="item" v-on:click="showmenu($event, 3)">
        帮助(<label>H</label>)
      </div> -->
    </div>
    <div class="window-border">
      <div class="app-main">
        <context-menu
          :data="contextmenu"
          ref="contextmenu"
          @click="contextMenuClick"
        />

        <div class="table">
          <div class="header">
            <div class="item">名称</div>
            <div class="item">原位置</div>
            <div class="item">删除日期</div>
            <div class="item">类型</div>
            <div class="item">大小</div>
          </div>
          <div class="content">
            <div
              class="item"
              :class="{ selected: item.isselected == true }"
              v-for="(item, index) in list"
              :key="index"
            >
              <div
                class="value"
                @click="select(item)"
                @mousedown="mousedown($event, item)"
              >
                <img :src="require('../../assets/' + item.icon + '.png')" />{{
                  item.name
                }}
              </div>
              <div class="value">{{ item.location }}</div>
              <div class="value">{{ item.deldate }}</div>
              <div class="value">{{ item.type }}</div>
              <div class="value">{{ item.size }}</div>
            </div>
            <!-- <div class="item selected">
              <div class="value">
                <img src="../../assets/txt.png" />文本asfffffffffsfsafas文档
              </div>
              <div class="value">Desktop</div>
              <div class="value">2022/3/23 2:32</div>
              <div class="value">文本文档</div>
              <div class="value">0KB</div>
            </div> -->
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
      contextmenu: [],
      menubar_contextmenu: [],
      list: [],
      selectItem: null,
    };
  },
  mounted() {
    this.list = this.$store.state.client.recycleList;
  },
  methods: {
    restore() {
      this.del();

      var shortcutList = this.$store.state.client.shrotcutList;
      shortcutList.push(this.selectItem.data);
      this.$store.dispatch("client/updateShrotcutList", shortcutList);
    },
    clear() {
      this.list = [];
      this.$store.dispatch("client/updateRecycleList", []);
      this.$store.dispatch("client/set", {
        isRecycleEmpty: true,
      });
    },
    del() {
      var list = this.list;
      list.forEach((item, index) => {
        if (this.selectItem == item) {
          list.splice(index, 1);
          return;
        }
      });

      this.$store.dispatch("client/updateRecycleList", list);
    },
    mousedown(event, item) {
      if (event.button != 2) {
        return;
      }

      this.contextmenu = [
        {
          title: "还原",
          type: "menu",
          command: "restore",
          disabled: !this.selectItem,
        },
        {
          type: "line",
        },
        {
          title: "剪切",
          type: "menu",
          disabled: true,
        },
        {
          type: "line",
        },
        {
          title: "删除",
          type: "menu",
          command: "del",
        },
        {
          type: "line",
        },
        {
          title: "属性",
          type: "menu",
          disabled: true,
        },
      ];

      this.select(item);
      let x, y;
      x = event.target.getBoundingClientRect().left;
      y = event.target.getBoundingClientRect().top;
      let contextmenu = this.$refs.contextmenu;
      contextmenu.show({
        clientX: x - 4,
        clientY: y + 14,
      });
    },
    contextMenuClick(item) {
      switch (item.command) {
        case "del":
          this.del();
          break;
        case "restore":
          this.restore();
          break;
        case "exit":
          this.exit();
          break;
        case "clear":
          this.clear();
          break;
      }
    },
    select(item) {
      this.list.forEach((e) => {
        if (e == item) {
          e.isselected = true;
          this.selectItem = item;
        } else {
          e.isselected = false;
        }
      });
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
            title: "还原",
            type: "menu",
            command: "restore",
            disabled: this.selectItem ? false : true,
          });
          this.menubar_contextmenu.push({
            type: "line",
          });
          this.menubar_contextmenu.push({
            title: "清空回收站",
            type: "menu",
            command: "clear",
            disabled: this.list.length > 0 ? false : true,
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
.table {
  width: 100%;
  text-align: left;

  .header {
    display: flex;
    align-items: center;
    // box-shadow: 1px 1px 0 0 black;
    margin-right: 1px;
    .item {
      // box-shadow:inset 2px 2px 0 0 black;
      width: 24%;
      border: 1px solid #ffffff;
      border-right-color: #000;
      border-bottom-color: #000;
      background: #c0c7c8;
      padding: 2px 0;
      padding-left: 5px;
    }
    .item:last-child {
      width: 10%;
    }
  }
  .content {
    .item {
      display: flex;
      align-items: center;
      .value {
        width: 24%;
        padding-left: 5px;
        display: flex;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        border: 1px solid transparent;
        img {
          height: 15px;
          margin-right: 3px;
        }
      }
      .value:first-child {
        padding-left: 1px;
      }
      .value:last-child {
        width: 10%;
      }
    }
    .selected {
      .value:first-child {
        background: #0000a8;
        color: #ffffff !important;
        border: 1px dotted white;

        img {
          filter: contrast(25%);
        }
      }
    }
  }
}
</style>
