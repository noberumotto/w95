<template>
  <div class="app-container folder" ref="folder">
    <context-menu
      :data="menubar_contextmenu"
      ref="menubar_contextmenu"
      @click="menuBarClick"
    />
    <div class="menu-bar">
      <div class="item" v-on:click="showmenu($event, 0)">
        文件(<label>F</label>)
      </div>
      <div class="item" v-on:click="showmenu($event, 1)">
        视图(<label>V</label>)
      </div>
      <div class="item" v-on:click="showmenu($event, 3)">
        帮助(<label>H</label>)
      </div>
    </div>

    <div class="window-border">
      <div class="app-main">
        <div class="container">
          <div class="table-header" v-if="show == 'details'">
            <div class="item" @click="changeSort('name')">名称</div>
            <div class="item" @click="changeSort('size')">大小</div>
            <div class="item" @click="changeSort('type')">类型</div>
            <div class="item" @click="changeSort('time')">修改日期</div>
            <div class="item">1</div>
          </div>

          <div
            class="folder_container"
            :class="{ 'details-view': show == 'details' }"
            ref="folder_container"
          >
            <div
              class="fileitem"
              v-for="(item, index) in shrotcutList"
              :key="'folder_' + pid + '_' + index"
            >
              <shortcut
                :icon="item.icon"
                :name="item.name"
                :index="index"
                :type="item.type"
                :selected="item.selected"
                :args="item.args"
                :app="item.app"
                :styleType="show == 'details' ? 'row' : 'col'"
                v-on:tap="shortcutTap"
                v-on:dbtap="shortcutDbTap"
                v-on:loaded="shortcutLoaded"
                :color="'#000000'"
              />

              <div class="details-item" v-if="show == 'details'">
                <div class="value" style="text-align: right">
                  <label style="margin-right: 15px">{{
                    convertSize(item.args.size)
                  }}</label>
                </div>
                <div class="value">{{ convertTypeToString(item.type) }}</div>
                <div class="value">{{ convertTime(item.args.updateTime) }}</div>
              </div>
            </div>
            <div class="selecter" ref="selecter"></div>
          </div>
          <div class="statusbar">
            <div class="item">
              {{
                selectedCount > 0
                  ? "选定了 " + selectedCount + " 个对象"
                  : statusText
              }}
            </div>
            <div class="item" v-if="selectedSize">{{ selectedSize }}</div>
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
import Window from "../Window.vue";
import Btn from "../Btn.vue";
import BadImage from "../BadImage.vue";
import config from "../../config";
import size from "../../library/size";
import time from "../../library/time";

export default {
  components: { Shortcut, Window, Btn, ContextMenu, BadImage },
  name: "Folder",
  props: {
    /**
     * 进程id，每个app必有
     */
    pid: Number,
    files: Array,
  },
  computed: {
    ...mapState(["client"]),
  },
  data() {
    return {
      //  是否抓住桌面
      isCap: false,
      //  选中项
      selectedCount: 0,
      statusText: "5 个对象",
      shrotcutList: [],
      menubar_contextmenu: [],
      windows: [],
      selectedSize: "",
      //  显示方式：icon图标，details详细信息
      show: "icon",
      //  排序方式名称：time修改时间，name名称，size大小，type类型
      sortname: "time",
      //  升降序 desc|asc
      order: "desc",
    };
  },
  mounted() {
    if (this.$props.files) {
      this.shrotcutList = JSON.parse(JSON.stringify(this.$props.files));

      this.sort();
    }
    this.windows.push(this.$refs.aboutwindow);
    this.handleMousedown();
    this.statusText = this.shrotcutList.length + " 个对象";
    this.computeSize();
  },
  watch: {
    selectedCount: function () {
      this.computeSize();
    },
  },
  methods: {
    changeSort(name) {
      if (name == this.sortname) {
        this.order = this.order == "asc" ? "desc" : "asc";
      } else {
        this.sortname = name;
      }
      this.sort();
    },
    sort() {
      // return;
      let t = this;
      this.shrotcutList.sort(function (a, b) {
        var a_, b_;

        if (t.sortname == "time" || t.sortname == "size") {
          a_ = a.args.updateTime;
          b_ = b.args.updateTime;

          if (t.sortname == "size") {
            a_ = a.args.size;
            b_ = b.args.size;
          }

          return t.order == "asc" ? a_ - b_ : b_ - a_;
        } else if (t.sortname == "type" || t.sortname == "name") {
          a_ = a.name.toUpperCase();
          b_ = b.name.toUpperCase();
          if (t.sortname == "type") {
            a_ = a.type.toUpperCase();
            b_ = b.type.toUpperCase();
          }
          if (t.order == "asc") {
            if (b_ < a_) {
              return -1;
            }
            if (a_ > b_) {
              return 1;
            }
            return 0;
          } else {
            if (a_ < b_) {
              return -1;
            }
            if (b_ > a_) {
              return 1;
            }
            return 0;
          }
        }
      });
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
    menuBarClick(e) {
      switch (e.command) {
        case "exit":
          this.exit();
          break;
        case "open":
          this.openSelected();
          break;
        case "about":
          this.about();
          break;
        case "icon":
        case "details":
          this.show = e.command;
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
          if (this.selectedCount > 0) {
            this.menubar_contextmenu.push({
              title: "打开(O)",
              type: "menu",
              command: "open",
            });
          } else {
            this.menubar_contextmenu.push({
              title: "新建(W)",
              type: "menu",
              disabled: true,
            });
          }
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
        case 1:
          //  视图

          this.menubar_contextmenu = [
            {
              title: "图标",
              type: "menu",
              checked: this.show == "icon",
              command: "icon",
            },
            {
              title: "详细信息",
              type: "menu",
              checked: this.show == "details",
              command: "details",
            },
          ];
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
              title: "关于 Mindows",
              type: "menu",
              command: "about",
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
    openSelected() {
      this.shrotcutList.forEach((item) => {
        if (item.selected) {
          item.el.open();
        }
      });
    },
    /**
     * 获取选中的数目
     */
    getselectedItemCount() {
      let count = 0;
      this.shrotcutList.forEach((item) => {
        if (item.selected) {
          count++;
        }
      });
      return count;
    },
    //  当每个快捷方式被渲染完成时
    shortcutLoaded(item) {
      this.shrotcutList[item.index].el = item;
      this.shrotcutList[item.index].locationInfo = {
        x: item.$el.getBoundingClientRect().left,
        y: item.$el.getBoundingClientRect().top,
        w: item.$el.offsetWidth,
        h: item.$el.offsetHeight,
      };
      // console.log(this.shrotcutList[item.index].locationInfo)
    },
    handleMousedown() {
      //  桌面容器
      let container = this.$refs.folder_container;
      //  右键菜单
      let contextmenu = this.$refs.contextmenu;
      let menubar_contextmenu = this.$refs.menubar_contextmenu;
      //  选择器
      let selecter = this.$refs.selecter;
      let t = this;

      let folder = this.$refs.folder.parentNode.parentNode.parentNode;
      // console.log(folder.parentNode.parentNode.parentNode)

      let clickX, clickY;
      container.onmousedown = function (ev) {
        // ev.stopPropagation();

        menubar_contextmenu.hide();
        //  右键
        if (ev.button == 2) {
          //  桌面右键菜单
          contextmenu.show(ev).then((e) => {});
        } else {
          //  清除选中
          t.shrotcutList.forEach((item, index) => {
            item.selected = false;

            //  更新项目位置
            item.locationInfo = {
              x: item.el.$el.getBoundingClientRect().left,
              y: item.el.$el.getBoundingClientRect().top,
              w: item.el.$el.offsetWidth,
              h: item.el.$el.offsetHeight,
            };
          });

          if (ev.target.className == "folder_container") {
            //  更新项目位置

            //  设定状态
            let diffLeft = container.getBoundingClientRect().left;
            let diffTop = container.getBoundingClientRect().top;

            t.isCap = true;
            selecter.style.left = ev.clientX - diffLeft + "px";
            selecter.style.top = ev.clientY - diffTop + "px";
            clickX = ev.clientX;
            clickY = ev.clientY;
          }

          t.selectedCount = t.getselectedItemCount();
        }
      };
      container.onmouseup = function (ev) {
        //  清除状态
        if (t.isCap) {
          t.isCap = false;
          selecter.style.display = "none";

          // //  重置临时选中
          // t.selecterCapList.forEach((index) => {
          //   t.shrotcutList[index].selected = false;
          // });

          // //  重新计算碰撞
          // t.collideHandle();
        }
      };
      container.onmousemove = function (ev) {
        if (!t.isCap) {
          return;
        }
        selecter.style.display = "block";
        let diffLeft = container.getBoundingClientRect().left;
        let diffTop = container.getBoundingClientRect().top;

        let w = ev.clientX - selecter.style.left.replace("px", "") - diffLeft;
        let h = ev.clientY - selecter.style.top.replace("px", "") - diffTop;

        if (clickX > ev.clientX) {
          //  往左了
          selecter.style.left = ev.clientX - diffLeft + "px";

          //  重新计算宽度
          w = clickX - ev.clientX;
        }

        if (clickY > ev.clientY) {
          //  往左了
          selecter.style.top = ev.clientY - diffTop + "px";

          //  重新计算宽度
          h = clickY - ev.clientY;
        }

        selecter.style.width = w + "px";
        selecter.style.height = h + "px";

        t.collideHandle();
        // window.style.top = ev.clientY - diffY + "px";
      };
    },
    //  选择器碰撞处理
    collideHandle() {
      //  选择器
      let selecter = this.$refs.selecter;
      let boxX = selecter.getBoundingClientRect().left;
      let boxY = selecter.getBoundingClientRect().top;
      let t = this;
      let boxMaxX =
        boxX + Number.parseInt(selecter.style.width.replace("px", ""));
      let boxMaxY =
        boxY + Number.parseInt(selecter.style.height.replace("px", ""));

      // console.log(boxX + "," + boxY + "|" + boxMaxX + "," + boxMaxY);
      this.shrotcutList.forEach((item, index) => {
        let itemX = item.locationInfo.x;
        let itemMaxX = itemX + item.locationInfo.w;
        let itemY = item.locationInfo.y;
        let itemMaxY = itemY + item.locationInfo.h;

        // console.log(itemMaxX+","+itemMaxY)
        let isCollide = false;
        if (
          boxX >= itemX &&
          boxX <= itemMaxX &&
          boxY >= itemY &&
          boxY <= itemMaxY
        ) {
          isCollide = true;
        }

        if (
          boxX <= itemX &&
          boxMaxX >= itemX &&
          boxY <= itemY &&
          boxMaxY >= itemY
        ) {
          isCollide = true;
        }

        if (
          boxX >= itemX &&
          boxX <= itemMaxX &&
          boxY <= itemY &&
          boxMaxY >= itemY
        ) {
          isCollide = true;
        }

        if (
          boxMaxX >= itemX &&
          boxX <= itemX &&
          boxY <= itemY &&
          boxMaxY >= itemY
        ) {
          isCollide = true;
        }

        if (
          boxX <= itemX &&
          boxMaxX >= itemX &&
          boxY >= itemY &&
          boxY <= itemMaxY
        ) {
          isCollide = true;
        }
        if (isCollide) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        t.selectedCount = t.getselectedItemCount();
      });
    },
    shortcutTap(e) {
      this.shrotcutList.forEach((item, index) => {
        item.selected = e.index == index ? true : false;
      });
      this.selectedCount = this.getselectedItemCount();
    },
    shortcutDbTap(e) {
      // this.runAppList.push({
      //   pid: this.runAppList.length + 1,
      //   name: e.app,
      // });
    },
    computeSize() {
      var total = 0;
      this.shrotcutList.forEach((item) => {
        if (
          (this.selectedCount > 0 && item.selected && item.app != "Folder") ||
          (this.selectedCount == 0 && item.app != "Folder")
        ) {
          //  计算文件大小
          total += item.args.size;
        }
      });
      if (total > 0) {
        this.selectedSize = size.toString(total);
      } else if (total < 0) {
        this.selectedSize = "未知";
      } else {
        this.selectedSize = "0字节";
      }
    },

    about() {
      this.$msgbox({
        title: "关于 Mindows",
        icon: "textlogo",
        btnalgin: "right",
        content:
          "Berumotto Mindows<br/>一台陈旧的电脑<br/><br/><br/>当前用户:<br/>" +
          config.user +
          "<hr/>Based on Vue",
      });
      // this.$refs.aboutwindow.show();
    },
    /**
     * 结束app，每个必须有
     */
    exit() {
      this.$store.dispatch("client/exitapp", this.$props.pid);
      // this.windows.forEach((element) => {
      //   element.close();
      // });
    },
  },
};
</script>

<style lang="scss" scoped>
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
    width: 20px;
    flex: unset;
    color: #c0c7c8;
  }
}
.app-main {
  position: relative;
  // background: #c0c7c8;
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
  box-shadow: inset 0 0 1px 1px #87888f;
  .folder_container {
    background: #ffffff;
    flex: 1;
    position: relative;
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    align-content: flex-start;
    border-bottom: 1px solid #fff;
    border-right: 1px solid #fff;
    // margin-left: -1px;
    margin-top: 2px;
    // box-shadow: inset 0 0 1px 1px #87888f;
    overflow: scroll;
    // margin-right: 1px;
    .shortcut {
      margin-bottom: 8px;
    }
    .shortcut:last-child {
      margin-bottom: 0;
    }
  }

  .details-view {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 2px;
    .shortcut-container {
      width: 26%;
      padding-right: 5px;
    }

    .fileitem {
      width: 100%;
      display: flex;
      align-items: center;
      .details-item {
        flex: 1;
        display: flex;
        .value {
          flex: 1;
          text-align: left;
        }
      }
    }
  }
}
.selecter {
  position: absolute;
  z-index: 2;
  border: 1px dotted #000000;
  width: 0;
  height: 0;
  left: 0;
  right: 0;
  display: none;
}
.statusbar {
  background: #c0c7c8;
  border-top: 2px solid #c0c7c8;
  // border: 1px solid #6d6d6d;
  // border-right-color: #ffffff;
  // border-bottom-color: #ffffff;
  box-shadow: inset 1px 1px 0 0 #87888f;
  margin-left: -1px;
  margin-top: 0px;
  text-align: left;

  display: flex;
  align-items: center;
  .item {
    padding: 3px 5px;
    border-right: 1px solid #ffffff;
  }
  .item:last-child {
    border-left: 1px solid #6d6d6d;
    margin-left: 2px;
    border-right: 0;
  }
}
</style>
