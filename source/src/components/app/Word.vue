<template>
  <div class="app-container wordpad" ref="wordpad">
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
    <div><hr /></div>
    <div class="toolbar">
      <btn class="btn disabled" :width="22" :height="22">
        <img src="../../assets/newdocument.png" />
      </btn>
      <btn class="btn disabled" :width="22" :height="22">
        <img src="../../assets/open.png" />
      </btn>
      <btn class="btn" :width="22" :height="22">
        <img src="../../assets/save.png" />
      </btn>
      <btn class="btn mr disabled" :width="22" :height="22">
        <img src="../../assets/print.png" />
      </btn>
      <btn class="btn disabled" :width="22" :height="22">
        <img src="../../assets/search.png" />
      </btn>

      <btn class="btn mr disabled" :width="22" :height="22">
        <img src="../../assets/find.png" />
      </btn>

      <btn class="btn mr" :width="22" :height="22">
        <img src="../../assets/cut.png" />
      </btn>
      <btn class="btn" :width="22" :height="22">
        <img src="../../assets/copy.png" />
      </btn>
      <btn class="btn" :width="22" :height="22">
        <img src="../../assets/paste.png" />
      </btn>
      <btn class="btn" :width="22" :height="22">
        <img src="../../assets/undo.png" />
      </btn>

      <btn class="btn mr disabled" :width="22" :height="22">
        <img src="../../assets/datetime.png" />
      </btn>
      <div class="line"></div>
    </div>
    <div><hr /></div>
    <div class="toolbar">
      <div class="select mainborder" style="width: 230px">
        <div class="text">宋体</div>
        <div class="btn">
          <btn class="smbtn" :width="19" :height="19"
            ><img src="../../assets/right.png" />
          </btn>
        </div>
      </div>
      <div class="select mainborder mr" style="width: 60px">
        <div class="text">12</div>
        <div class="btn">
          <btn class="smbtn" :width="19" :height="19"
            ><img src="../../assets/right.png" />
          </btn>
        </div>
      </div>
      <btn class="btn mr disabled" :width="22" :height="22">
        <img src="../../assets/bold.png" />
      </btn>
      <btn class="btn disabled" :width="22" :height="22">
        <img src="../../assets/italic.png" />
      </btn>
      <btn class="btn disabled" :width="22" :height="22">
        <img src="../../assets/underline.png" />
      </btn>
      <btn class="btn disabled" :width="22" :height="22">
        <img src="../../assets/color.png" />
      </btn>
    </div>
    <div><hr /></div>

    <div class="window-border">
      <div class="app-main">
        <div ref="content" v-html="html"></div>
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
import TextBox from "../TextBox.vue";
import { marked } from "marked";
import badimage from "../../library/badimage";

export default {
  components: { Shortcut, ContextMenu, Window, Btn, TextBox },
  name: "Word",
  props: {
    /**
     * 进程id，每个app必有
     */
    pid: Number,
    /**
     * 路径或URL
     */
    file: String,
  },
  computed: {
    ...mapState(["client"]),
  },
  data() {
    return {
      menubar_contextmenu: [],
      text: "",
      findword: "",
      findIndex: 0,
      html: "",
    };
  },
  mounted() {
    if (!this.$props.file) {
      this.text = "文件路径错误";
    } else {
      let md = require("../../" + this.$props.file);
      let renderer = {
        image(href, title, text) {
          let img = href;
          if (img.length == 0) {
            return text;
          }
          if (img.indexOf("http://") == -1 && img.indexOf("https://") == -1) {
            try {
              let option = 'data-width="0"';

              if (img.indexOf("?") != -1) {
                img = img.split("?")[0];
                option = 'data-width="' + href.split("?")[1] + '"';
              }
              img = require("../../disk/" + img);

              return `
           <canvas name="image" ${option} data-src="${img}" width="0" height="0"/>
            `;
            } catch {
              return `[img]`;
            }
          } else {
            return `
           <img src="${img}"/>
            `;
          }
        },
      };

      marked.use({ renderer });
      this.html = marked.parse(md.default);
      this.$nextTick(() => {
        this.handleImage();
      });
    }
  },
  methods: {
    handleImage() {
      var maxWidth = this.$refs.content.getBoundingClientRect().width - 57;
      document.getElementsByName("image").forEach((element) => {
        badimage.set({
          canvas: element,
          src: element.dataset.src,
          maxWidth: maxWidth,
          width: element.dataset.width,
        });
        element.dataset.src = "";
      });
    },
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
    about() {},
  },
};
</script>

<style lang="scss" scoped>
.wordpad {
  hr {
    margin: 2px 0;
  }
  .toolbar {
    padding: 0 5px;
    height: 25px;
    display: flex;
    align-items: center;
    .select {
      display: flex;
      align-items: center;
      background: white;
      height: 22px;
      justify-content: space-between;
      padding-left: 4px;
      .smbtn {
        display: flex;
        align-items: center;
        img {
          height: 10px;
          transform: rotate(90deg);
        }
      }
    }
    .line {
      height: 25px;
      width: 1px;
      border-left: 1px solid #909198;
      border-right: 1px solid #fff;
      background: #909198;
      margin-left: 6px;
    }
    .btn {
      img {
        height: 13px;
        width: 13px;
      }
    }
    .disabled {
      img {
        filter: grayscale(100%);
      }
    }
    .mr {
      margin-left: 8px;
    }
  }
}
.app-main {
  padding: 2px 10px;
}
// .content {
//   width: 100%;
//   height: 100%;
//   overflow: scroll;
//   text-align: left;
//   padding: 20px;
//   line-height: 2em;
// }
// .content >>> img {
//   max-width: 100%;
// }
// .content >>> h3 {
//   margin: 5px 0;
// }
// .content >>> ul {
//   padding-left: 25px;
// }
// .content >>> code {
//   background: #f5f5f5;
//   padding: 5px;
//   color: #6d6d6d;
//   margin: 0 5px;
// }
// .content >>> blockquote {
//   background: #f5f5f5;
//   padding: 5px;
//   color: #6d6d6d;
//   margin: 0 5px;
//   text-indent: 2em;
// }
</style>
