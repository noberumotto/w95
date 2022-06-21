<template>
  <div class="notepad" ref="notepad">
    <window
      :title="'搜索'"
      :width="386"
      :height="121"
      :icon="'txt'"
      ref="searchwindow"
      :iscenter="true"
      :closeBtn="true"
    >
      <div class="search-panel">
        <div>
          查找目标<text-box style="margin-left: 15px" v-model="findword" />
        </div>
        <div>
          <btn v-on:click.native="findWord" :width="100" :height="25"
            >查找下一个</btn
          >
        </div>
      </div>
    </window>

    <context-menu
      :data="menubar_contextmenu"
      ref="menubar_contextmenu"
      @click="contextmenuClick"
    />
    <div class="header">
      <div class="item" ref="filemenu" v-on:click="showmenu(0)">
        文件(<label>F</label>)
      </div>
      <div class="item" ref="searchmenu" v-on:click="showmenu(1)">
        搜索(<label>S</label>)
      </div>
      <!-- <div class="item" ref="helpmenu" v-on:click="showmenu(3)">
        帮助(<label>H</label>)
      </div> -->
    </div>
    <div class="border">
      <div class="container" ref="container">
        <textarea v-model="text" ref="textarea" @keydown.stop="keyDown" />
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

export default {
  components: { Shortcut, ContextMenu, Window, Btn, TextBox },
  name: "Notepad",
  props: {
    /**
     * 进程id，每个app必有
     */
    pid: Number,
    /**
     * 路径或URL
     */
    file: String,
    content: String,
    shortcut: Object,
    args: Object,
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
    };
  },
  mounted() {
    let t = this;
    if (!this.$props.file) {
      this.text = this.content;
    } else {
      this.text = require("../../" + this.$props.file).default;
    }
  },
  methods: {
    keyDown(e) {
      if (e.key == "s" && e.ctrlKey) {
        e.preventDefault();
        console.log("保存");
        this.save();
      }
      if (e.key == "F3") {
        e.preventDefault();
        this.findWord();
        console.log("搜索");
      }
    },
    showmenu(num) {
      let x, y;
      let t = this;
      switch (num) {
        case 0:
          //  文件
          x = this.$refs.filemenu.getBoundingClientRect().left;
          y = this.$refs.filemenu.getBoundingClientRect().top;
          this.menubar_contextmenu = [];

          this.menubar_contextmenu.push({
            title: "新建(W)",
            type: "menu",
            disabled: true,
          });
          this.menubar_contextmenu.push({
            title: "打开(O)...",
            type: "menu",
            disabled: true,
          });
          this.menubar_contextmenu.push({
            title: "保存(S)",
            type: "menu",
            command: "save",
            disabled: this.file ? true : false,
          });
          this.menubar_contextmenu.push({
            title: "另存为(A)...",
            command: "saveas",
            type: "menu",
          });

          this.menubar_contextmenu.push({
            type: "line",
          });
          this.menubar_contextmenu.push({
            title: "退出(X)",
            type: "menu",
            command: "exit",
          });

          break;
        case 1:
          //  搜索
          x = this.$refs.searchmenu.getBoundingClientRect().left;
          y = this.$refs.searchmenu.getBoundingClientRect().top;
          this.menubar_contextmenu = [
            {
              title: "查找(F)...",
              type: "menu",
              // disabled: true,
              command: "find",
            },
            {
              title: "查找下一个(N) F3",
              type: "menu",
              command: "findnext",
            },
          ];
          break;
        case 3:
          //  帮助
          x = this.$refs.helpmenu.getBoundingClientRect().left;
          y = this.$refs.helpmenu.getBoundingClientRect().top;
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
              title: "关于 记事本(A)",
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
    contextmenuClick(e) {
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
        case "saveas":
          this.saveto();
          break;
        case "find":
          this.find(true);
          break;
        case "findnext":
          this.find();
          break;
        case "save":
          this.save();
          break;
      }
    },
    find(show = false) {
      if (!show) {
        this.findWord();
        return;
      }
      this.$refs.searchwindow.show();
    },
    findWord() {
      if (this.findword) {
        let textarea = this.$refs.textarea;

        let index = this.text.indexOf(this.findword, this.findIndex);

        if (index != -1) {
          this.findIndex = index + 1;
          textarea.blur();
          textarea.focus();
          // index = index - 1 >= 0 ? index - 1 : 0;
          textarea.setSelectionRange(index, index + this.findword.length);
        } else {
          this.findIndex = 0;
        }
      }
    },
    saveto() {
      let urlObject = window.URL || window.webkitURL || window;
      let blob = new Blob([this.text]);
      let link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
      link.href = urlObject.createObjectURL(blob);
      link.download = this.args.subtitle + ".txt";
      link.click();
    },
    save() {
      var shortcutList = this.$store.state.client.shrotcutList;

      var shortcut = shortcutList.find((e) => e.id == this.shortcut.id);

      // shortcut.name = "test";
      shortcut.args.content = this.text;

      shortcut.args.updateTime = Date.now();
      shortcut.args.size = this.text.length;

      this.$store.dispatch("client/updateShrotcutList", shortcutList);
      // this.shortcut.name = "test";
    },

    /**
     * 结束app，每个必须有
     */
    exit() {
      console.log(this.$props.pid);
      this.$store.dispatch("client/exitapp", this.$props.pid);
    },
    about() {
      this.$refs.aboutwindow.show();
    },
  },
};
</script>

<style lang="scss" scoped>
.notepad {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  .border {
    flex: 1;
    .container {
      height: 100%;
      width: 100%;
      position: relative;

      background: #ffffff;
      border: 1px solid #6d6d6d;
      border-right-color: #ccc;
      border-bottom-color: #ccc;

      display: flex;
      align-items: center;
      justify-content: center;
      textarea {
        width: 100%;
        height: 100%;
        border: none;
        resize: none;
      }
    }
  }
}
.border {
  border: 1px solid #6d6d6d;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
}

.header {
  display: flex;
  align-items: center;
  margin-top: 1px;
}
.header .item {
  padding: 2px 6px;
  text-align: center;
}
.header .item label {
  text-decoration: underline;
}
.header .item:hover {
  background: #0000aa;
  color: #ffffff;
}

.about-panel {
  display: flex;
  text-align: left;
  padding: 10px;
}
.about-panel p {
  margin-top: 0;
}

.search-panel {
  display: flex;
  justify-content: space-between;
  padding: 15px;
}
</style>
