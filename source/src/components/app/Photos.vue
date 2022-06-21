<template>
  <div class="app-container photo" ref="photo">
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
      <div class="app-main">
        <div
          class="container"
          :class="{
            scaleWidth: scaleWidth,
            scaleHeight: scaleHeight,
          }"
        >
          <!-- <div>1</div>
          <div class="scrollview"> -->
          <canvas ref="canvas" v-if="file && isbadimage" />
          <img
            v-if="!isfail && file && !isbadimage"
            :src="webimg ? webimg : file"
          />
          <!-- </div> -->
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
import config from "../../config";

export default {
  components: { Shortcut, ContextMenu, Window, Btn },
  name: "Photos",
  props: {
    /**
     * 进程id，每个app必有
     */
    pid: Number,
    /**
     * 照片路径或URL
     */
    file: String,
  },
  computed: {
    ...mapState(["client"]),
  },
  data() {
    return {
      menubar_contextmenu: [],
      isfail: false,
      imageObj: null,
      width: 0,
      height: 0,
      isbadimage: false,
      scaleWidth: false,
      scaleHeight: false,
      webimg: "",
    };
  },
  mounted() {
    let dataFile = this.$props.file;

    let t = this;

    if (dataFile.indexOf(".webimg") != -1) {
      this.webimg = require("../../" + this.$props.file).default.src;
    } else {
      this.imageObj = new Image();
      if (
        this.$props.file.indexOf("http://") == -1 &&
        this.$props.file.indexOf("https://") == -1
      ) {
        this.isbadimage = true;
        this.imageObj.onload = function () {
          t.width = this.width;
          t.height = this.height;
          t.handle();
        };
        this.imageObj.src =
          this.$props.file.indexOf("data:image") == -1
            ? require("../../" + this.$props.file)
            : this.$props.file;
      }
    }
  },
  methods: {
    menuBarClick(item) {
      switch (item.command) {
        case "exit":
          this.exit();
          break;
        case "saveas":
          this.saveas();
          break;
        case "about":
          this.about();
          break;
      }
    },
    saveas() {
      if (this.isbadimage) {
        var image = this.$refs.canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");

        var a = document.createElement("a");
        a.href = image;
        a.download = "photo.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
              action: "open",
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
            title: "另存为...",
            type: "menu",
            command: "saveas",
            disabled: !this.isbadimage,
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
              title: "关于 照片(A)",
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
    handle() {
      let canvas = this.$refs.canvas;
      let ctx = canvas.getContext("2d");

      let maxwidth = 600;
      let maxheight = 600;

      //  缩放比例
      if (this.width >= maxwidth) {
        let rate = maxwidth / this.width;
        this.width = rate * this.width;
        this.height = rate * this.height;
        this.scaleWidth = true;
      }
      if (this.height > maxheight) {
        let rate = maxheight / this.height;
        this.width = rate * this.width;
        this.height = rate * this.height;
        this.scaleHeight = true;
      }

      canvas.width = this.width;
      canvas.height = this.height;

      let imgarr = [];
      for (let i = 0; i < this.width * this.height; i++) {
        imgarr.push(i);
      }

      let arr = [];
      for (let i = 0; i < imgarr.length / 20; i++) {
        arr.push(imgarr.splice(imgarr.length * Math.random(), 1));
      }

      ctx.drawImage(this.imageObj, 0, 0, this.width, this.height);

      let imgData = ctx.getImageData(0, 0, this.width, this.height);
      for (var i = 0; i < this.width * this.height; i++) {
        imgData.data[0.1 * imgarr[i] + 10] = 120;
        imgData.data[0.4 * imgarr[i] + 1] = 125;
        imgData.data[20 * imgarr[i] + 5] = parseInt(Math.random() * 125);
        imgData.data[4 * imgarr[i] + 1] = 110;
      }
      ctx.putImageData(imgData, 0, 0);
    },
    /**
     * 结束app，每个必须有
     */
    exit() {
      console.log(this.$props.pid);
      this.$store.dispatch("client/exitapp", this.$props.pid);
    },
    fail() {
      this.isfail = true;
      console.log("img fail");
    },
    about() {
      this.$msgbox({
        title: "关于 照片",
        icon: "photos",
        btnalgin: "right",
        content:
          "一个老旧的图像查看软件<br/><br/><br/><br/>当前用户:<br/>" +
          config.user +
          "<hr/>Based on Vue",
      });
      // this.$refs.aboutwindow.show();
    },
  },
};
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
}
.container {
  // background: red;
  display: flex;
  align-items: center;
  justify-content: center;
  // flex-direction: column;
  // width: 100%;
  // background: yellow;
  // height: 100%;
  box-sizing: border-box;
  padding: 20px;
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  overflow: scroll;
  text-align: center;
  canvas {
    max-width: 100%;
  }

  img {
    max-width: 100%;
  }
}
.scaleWidth {
  // display: unset;
  canvas {
    width: 100%;
  }
}
.scaleHeight {
  display: unset;

  canvas {
    width: 50%;
  }
}
</style>
