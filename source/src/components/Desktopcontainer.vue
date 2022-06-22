<template>
  <div class="desktopcontainer" ref="desktop_container">
    <!--desktop bg-->
    <bad-image
      :width="300"
      class="desktop-bg"
      :src="require('@/assets/berumotto.jpg')"
    />

    <context-menu
      :data="menuData"
      ref="desktop_contextmenu"
      @click="contextClick"
    />
    <shortcut
      v-for="(item, index) in client.shrotcutList"
      :key="'desktop_' + index"
      :icon="item.icon"
      :name="item.name"
      :index="index"
      :selected="item.selected"
      :isrename="item.isrename"
      :app="item.app"
      :args="item.args"
      :shortcutData="item"
      :type="item.type"
      v-on:tap="shortcutTap"
      v-on:dbtap="shortcutDbTap"
      v-on:loaded="shortcutLoaded"
    />
    <app v-for="item in client.runAppList" :key="item.pid" :info="item" />
    <div class="selecter" ref="selecter"></div>
  </div>
</template>

<script>
import Btn from "./Btn.vue";
import App from "./app/App.vue";
import { mapState } from "vuex";
// import diskData from "../data/data.json";
import ContextMenu from "./ContextMenu.vue";
import Shortcut from "./Shortcut.vue";
import BadImage from "./BadImage.vue";
import time from "../library/time";

export default {
  components: { Btn, ContextMenu, Shortcut, App, BadImage },
  name: "Desktopcontainer",
  props: {},
  computed: {
    ...mapState(["client"]),
  },
  data() {
    return {
      //  是否抓住桌面
      isCap: false,
      menuData: [],
      isshowMenu: false,
      shrotcutList: [
        // {
        //   icon: "recycle",
        //   name: "回收站",
        //   app: "Folder",
        //   selected: false,
        //   locationInfo: {
        //     x: 0,
        //     y: 0,
        //     w: 0,
        //     h: 0,
        //   },
        //   args: {
        //     title: "回收站",
        //     icon: "recycle",
        //     data: [],
        //   },
        // },
      ],
      //  运行的app集合
      runAppList: [],
      bgImageObj: null,
      bgWidth: 0,
      bgHeight: 0,
    };
  },
  mounted() {
    this.handleMousedown();

    this.loadData();

    // window.addEventListener("keydown", onkeydown);
  },
  watch: {
    shrotcutList: function (newVal) {
      this.$store.dispatch("client/updateShrotcutList", newVal);

      this.updateRecycle();
    },
    "$store.state.client.isRecycleEmpty": {
      deep: true,
      handler: function (newval, oldval) {
        this.updateRecycle();
      },
    },
  },
  methods: {
    updateRecycle() {
      var recycleList = this.$store.state.client.recycleList;

      var list = this.shrotcutList;

      var recycle = list.find((item) => item.id == 2);
      recycle.icon = recycleList.length > 0 ? "recycles2" : "recycle";

      this.shrotcutList = list;
    },
    loadData() {
      this.isRecycleEmpty = this.$store.state.client.isRecycleEmpty;

      var recycle = window.localStorage.getItem("berumotto_computer_recycle");
      var recycleList = [];
      if (recycle) {
        recycleList = JSON.parse(recycle);

        this.$store.dispatch("client/set", {
          recycleList: recycleList,
          isRecycleEmpty: recycleList.length > 0 ? false : true,
        });
      }

      var diskData = require("@/data/data.json");

      this.$store.dispatch("client/set", {
        diskData: diskData,
      });

      var mycomputer = this.getCreateShortcut({
        id: 1,
        type: "mycomputer",
        name: "我的电脑",
        args: {
          title: "我的电脑",
          icon: "shortcut/mycomputer",
          data: diskData,
        },
      });

      var recycle = this.getCreateShortcut({
        id: 2,
        type: "recycle",
        args: {},
      });

      var ie = this.getCreateShortcut({
        id: 3,
        type: "ie",
        args: {},
      });

      var shrotcutList = [];

      shrotcutList.push(mycomputer);
      shrotcutList.push(recycle);
      shrotcutList.push(ie);

      let userData = window.localStorage.getItem("berumotto_computer_data");
      if (userData) {
        shrotcutList = shrotcutList.concat(JSON.parse(userData));
      }

      this.shrotcutList = shrotcutList;
    },
    getCreateShortcut(options = { name: "" }) {
      var icon = "";
      var name = options.name;
      var app = "";
      var type = "";
      var id = 1;
      this.shrotcutList.forEach((item) => {
        if (item.id > id) {
          id = item.id;
        }
      });
      id++;
      if (options.id) {
        id = options.id;
      }

      switch (options.type) {
        case "mycomputer":
          icon = "shortcut/mycomputer";
          app = "Folder";
          break;
        case "txt":
          icon = "txt";
          app = "Notepad";
          type = "txt";
          break;
        case "image":
          icon = "webphoto";
          app = "Photos";
          type = "photo";
          break;
        case "recycle":
          icon = "recycle";
          name = "回收站";
          app = "Recycle";
          break;
        case "ie":
          icon = "ie";
          name = "互联网";
          app = "IE";
          break;
      }

      icon = options.icon ? options.icon : icon;

      options.args = Object.assign(
        {
          // location: "C:\\DESKTOP",
          createTime: Date.now(),
          updateTime: Date.now(),
        },
        options.args
      );

      if (!options.args.size) {
        options.args.size = 0;
      }
      if (!options.args.location) {
        options.args.location = "C:\\Desktop";
      }

      var shortcut = {
        id: id,
        icon: icon,
        name: name,
        app: app,
        isrename: false,
        type: type,
        selected: false,
        locationInfo: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        args: options.args,
      };

      return shortcut;
    },
    //  当每个快捷方式被渲染完成时
    shortcutLoaded(item) {
      this.shrotcutList[item.index].locationInfo = {
        x: item.$el.getBoundingClientRect().left,
        y: item.$el.getBoundingClientRect().top,
        w: item.$el.offsetWidth,
        h: item.$el.offsetHeight,
      };
    },
    getClipData(options = {}) {
      navigator.clipboard.readText().then((clipText) => {
        if (!clipText) {
          (async () => {
            try {
              const permission = await navigator.permissions.query({
                name: "clipboard-read",
              });
              if (permission.state === "denied") {
                throw new Error("Not allowed to read clipboard.");
              }
              const clipboardContents = await navigator.clipboard.read();
              for (const item of clipboardContents) {
                if (!item.types.includes("image/png")) {
                  throw new Error("Clipboard contains non-image data.");
                }
                const blob = await item.getType("image/png");

                const FR = new FileReader();

                FR.addEventListener("load", function (evt) {
                  options.success("image", {
                    src: evt.target.result,
                    length: blob.size,
                  });
                });

                FR.readAsDataURL(blob);
                // destinationImage.src = URL.createObjectURL(blob);
                // options.success("image", URL.createObjectURL(blob));
              }
            } catch (error) {
              options.faild(error.message);
            }
          })();
        } else {
          var regx =
            /((https|http|ftp|rtsp|mms)?:\/\/)(\S)*(\.)((jpg|gif|png))/;

          var match = regx.exec(clipText);
          if (match) {
            options.success("image", {
              src: match[0],
              length: -1,
            });
          } else {
            //  没有东西
            options.faild("empty");
          }
        }
      });
    },
    paste() {
      this.getClipData({
        success: (type, data) => {
          switch (type) {
            case "image":
              this.pasteImage(data);
              break;
          }
        },
      });
    },
    pasteImage(data) {
      var src = data.src;

      var spArr = src.split("/");
      var name = spArr[spArr.length - 1];

      var location =
        src.indexOf("http://") != -1 || src.indexOf("https://") != -1
          ? src
          : "C:\\Desktop";

      var shortcut = this.getCreateShortcut({
        name: name,
        type: "image",
        args: {
          type: "image",
          title: name,
          subtitle: name,
          data: src,
          size: data.length,
          location: location,
        },
      });

      this.shrotcutList.push(shortcut);
    },
    createDesktopRightMenu() {
      this.getClipData({
        success: (type, data) => {
          this.menuData = this.getDesktopRightMenu({ paste: true });
        },
        faild: (msg) => {
          this.menuData = this.getDesktopRightMenu();
        },
      });
    },
    getDesktopRightMenu(options = { paste: false }) {
      return [
        {
          disabled: true,
          title: "图标排序",
          type: "menu",
        },
        {
          disabled: true,
          title: "排列图标",
          type: "menu",
        },
        {
          type: "line",
        },
        {
          disabled: !options.paste,
          title: "粘贴",
          type: "menu",
          command: "paste",
        },
        {
          disabled: true,
          title: "粘贴快捷方式",
          type: "menu",
        },
        {
          type: "line",
        },
        {
          title: "新建",
          type: "menu",
          menus: [
            {
              title: "文件夹",
              disabled: true,
              type: "menu",
            },
            {
              title: "快捷方式",
              disabled: true,
              type: "menu",
            },
            {
              type: "line",
            },
            {
              title: "文本文档",
              command: "create_text",
              type: "menu",
            },
            {
              title: "写字板文档",
              command: "create_wordpad",
              disabled: true,
              type: "menu",
            },
            {
              title: "位图图像",
              disabled: true,
              type: "menu",
            },
          ],
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
    },
    handleMousedown() {
      //  桌面容器
      let container = this.$refs.desktop_container;
      //  右键菜单
      let contextmenu = this.$refs.desktop_contextmenu;
      //  选择器
      let selecter = this.$refs.selecter;
      let t = this;

      let clickX, clickY;
      container.onmousedown = (ev) => {
        //  右键
        if (ev.button == 2 && ev.target.className == "desktopcontainer") {
          // console.log(ev.target.className)
          //  桌面右键菜单
          this.createDesktopRightMenu();
          contextmenu.show(ev);
          ev.stopPropagation();
        } else {
          //  清除选中
          if (
            ev.target.className.indexOf("shortcut_") == -1 &&
            ev.button != 2
          ) {
            t.shrotcutList.forEach((item, index) => {
              item.selected = false;
            });
          }

          if (ev.target.className == "desktopcontainer") {
            //  设定状态
            t.isCap = true;
            selecter.style.left = ev.clientX + "px";
            selecter.style.top = ev.clientY + "px";
            clickX = ev.clientX;
            clickY = ev.clientY;
          }
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
      window.onmousemove = function (ev) {
        if (!t.isCap) {
          return;
        }
        selecter.style.display = "block";

        let w = ev.clientX - selecter.style.left.replace("px", "");
        let h = ev.clientY - selecter.style.top.replace("px", "");

        if (clickX > ev.clientX) {
          //  往左了
          selecter.style.left = ev.clientX + "px";

          //  重新计算宽度
          w = clickX - ev.clientX;
        }

        if (clickY > ev.clientY) {
          //  往左了
          selecter.style.top = ev.clientY + "px";

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

      this.shrotcutList.forEach((item, index) => {
        let itemX = item.locationInfo.x;
        let itemMaxX = itemX + item.locationInfo.w;
        let itemY = item.locationInfo.y;
        let itemMaxY = itemY + item.locationInfo.h;

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

        if (isCollide) {
          item.selected = true;
        } else {
          item.selected = false;
        }
      });
    },
    shortcutTap(e) {
      this.shrotcutList.forEach((item, index) => {
        item.selected = e.index == index ? true : false;
      });
    },
    shortcutDbTap(e) {
      // this.runAppList.push({
      //   pid: this.runAppList.length + 1,
      //   name: e.app,
      // });
    },
    contextClick(item) {
      switch (item.command) {
        case "paste":
          this.paste();
          break;
        case "create_text":
          this.createTextDocument();
          break;
      }
    },
    createTextDocument(name = "新建文本文档") {
      name = this.getTextDocumentName(name);
      var shortcut = this.getCreateShortcut({
        type: "txt",
        name: name,
        args: {
          subtitle: name,
          content: "",
        },
      });
      this.shrotcutList.push(shortcut);
    },
    getTextDocumentName(name) {
      let list = this.shrotcutList;
      return (function fn(newname = "", index = 1) {
        newname = newname == "" ? name : newname;
        index++;
        var document = list.find((item) => item.name == newname);
        if (document) {
          return fn(name + "(" + index + ")", index);
        }
        return newname;
      })();
    },
  },
};
</script>

<style scoped>
.desktopcontainer {
  width: 100%;
  height: 97%;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
}
.desktopcontainer .shortcut {
  margin-bottom: 8px;
}
.desktopcontainer .shortcut:last-child {
  margin-bottom: 0;
}
.selecter {
  position: absolute;
  z-index: 2;
  border: 1px dotted white;
  width: 0;
  height: 0;
  left: 0;
  right: 0;
  display: none;
}
.desktop-bg {
  position: absolute;
  width: 300px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto auto;
  pointer-events: none;
}
</style>
