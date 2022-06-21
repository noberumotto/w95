<template>
  <div class="app-container ie" ref="ie">
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
        <div class="container">
          <div class="navbar">
            <div class="item disabled">
              <div class="icon">
                <img src="../../assets/back.png" />
              </div>
              <div class="name">返回</div>
            </div>
            <div class="item disabled">
              <div class="icon">
                <img src="../../assets/go.png" />
              </div>
              <div class="name">前进</div>
            </div>
            <div class="item" @click="onCommand('stop')">
              <div class="icon">
                <img src="../../assets/stop.png" />
              </div>
              <div class="name">停止</div>
            </div>
            <div class="item" @click="onCommand('refresh')">
              <div class="icon">
                <img src="../../assets/refresh.png" />
              </div>
              <div class="name">刷新</div>
            </div>
            <div class="item" @click="onCommand('home')">
              <div class="icon">
                <img src="../../assets/home.png" />
              </div>
              <div class="name">主页</div>
            </div>
            <div class="item disabled">
              <div class="icon">
                <img src="../../assets/iesearch.png" />
              </div>
              <div class="name">搜索</div>
            </div>
            <div class="item">
              <div class="icon">
                <img src="../../assets/iefavorites.png" />
                <img class="min" src="../../assets/right.png" />
              </div>
              <div class="name">收藏</div>
            </div>
          </div>
          <div class="toolbar">
            <div class="splite"></div>
            <div class="splite"></div>
            <div class="mr">网址</div>
            <div class="select mainborder mr" style="width: 230px">
              <div class="text">
                <input type="url" :value="url" @keydown="input" />
              </div>
              <div class="btn">
                <btn class="smbtn" :width="19" :height="19"
                  ><img src="../../assets/right.png" />
                </btn>
              </div>
            </div>
            <div class="links">
              <div class="splite"></div>
              <div class="splite"></div>
              <div class="mr">链接</div>
              <div class="list">
                <div
                  class="link"
                  v-for="link in links"
                  :key="link.url"
                  @click="onCommand('link', link.url)"
                >
                  <img src="../../assets/link.png" />
                  {{ link.name }}
                </div>
              </div>
            </div>
          </div>

          <div class="webcontent mainborder">
            <iframe ref="iframe" :src="url" />
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
import config from "../../config";

export default {
  components: { Shortcut, Btn, ContextMenu },
  name: "InternetExplorer",
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
      url: "https://noberumotto.github.io/home/",
      home: "https://noberumotto.github.io/home/",
      links: [],
    };
  },
  mounted() {
    this.links = [
      {
        name: "planshit",
        url: "https://planshit.github.io/",
      },
      {
        name: "noberumotto computer",
        url: "https://noberumotto.github.io/",
      },
    ];
  },
  methods: {
    input(e) {
      if (e.key == "Enter") {
        this.onCommand("link", e.target.value);
      }
    },
    onCommand(command, arg) {
      switch (command) {
        case "refresh":
          this.$refs.iframe.src = this.url;
          break;
        case "home":
          this.$refs.iframe.src = this.home;
          this.url = this.home;
          break;
        case "stop":
          // this.$refs.iframe.src ='';
          break;
        case "link":
          this.$refs.iframe.src = arg;
          this.url = arg;
          break;
      }
    },

    menuBarClick(item) {
      switch (item.command) {
        case "exit":
          this.exit();
          break;
        case "about":
          this.about();
          brea;
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
            title: "新窗口",
            type: "menu",
            disabled: true,
          });
          this.menubar_contextmenu.push({
            title: "打开...",
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
    about() {
      this.$msgbox({
        title: "关于 Internet Explorer",
        icon: "ie",
        btnalgin: "right",
        content:
          "Internet Explorer<br/>已经退出历史舞台的浏览器<br/><br/><br/>当前用户:<br/>" +
          config.user +
          "<hr/>Based on Vue",
      });
      // this.$refs.aboutwindow.show();
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
.app-main {
  position: relative;
  background: #c0c7c8;
  border: none;
  .container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    .splite {
      width: 3px;
      height: 18px;
      background: #c0c7c8;
      border: 1px solid #fff;
      border-right: 1px solid #909198;
      border-bottom: 1px solid #909198;
      // margin: 0 10px;
    }
    .navbar {
      border-top: 1px solid #fff;
      border-bottom: 1px solid #909198;
      // padding: 3px 0;
      display: flex;
      align-items: center;
      .item {
        text-align: center;
        border: 1px solid transparent;
        width: 45px;
        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
          img {
            width: 20px;
            height: 20px;
            filter: grayscale(100%);
          }
          .min {
            width: 10px;
            height: 10px;
            transform: rotate(90deg);
          }
        }
      }
      .item:hover {
        border: 1px solid #ffffff;
        border-right: 1px solid #909198;
        border-bottom: 1px solid #909198;
        img {
          filter: none;
        }
      }
      .item:active {
        border: 1px solid #909198;
        border-right: 1px solid #ffffff;
        border-bottom: 1px solid #ffffff;
      }
    }
    .webcontent {
      flex: 1;
      background: white;
      iframe {
        width: 100%;
        height: 100%;
      }
    }
    .toolbar {
      padding: 14px 5px;
      height: 25px;
      display: flex;
      align-items: center;
      border-top: 1px solid #fff;
      margin-bottom: 4px;

      border-bottom: 1px solid #fff;
      .links {
        display: flex;
        margin-left: 5px;
        align-items: center;
        .list {
          display: flex;
          align-items: center;
          .link {
            display: flex;
            align-items: center;
            margin-left: 6px;
            border: 1px solid transparent;
            padding: 2px 4px;
            img {
              width: 16px;
              margin-right: 4px;
              filter: grayscale(100%);
            }
          }
          .link:hover {
            border: 1px solid #ffffff;
            border-right: 1px solid #909198;
            border-bottom: 1px solid #909198;
            img {
              filter: none;
            }
          }
          .link:active {
            border: 1px solid #909198;
            border-right: 1px solid #fff;
            border-bottom: 1px solid #fff;
          }
        }
      }
      .select {
        display: flex;
        align-items: center;
        background: white;
        height: 22px;
        justify-content: space-between;
        padding-left: 4px;
        .text {
          flex: 1;
        }
        input {
          border: none;
          width: 100%;
          height: 100%;
        }
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

      .mr {
        margin-left: 8px;
      }
    }
  }
}
.disabled {
  color: #909198;

  .name {
    text-shadow: 1px 1px white;
  }
}
.disabled:hover {
  border: 1px solid transparent !important;
  img {
    filter: none;
  }
}
</style>
