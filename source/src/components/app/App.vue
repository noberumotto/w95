<template>
  <div class="app">
    <window
      :titleIcon="icon"
      :title="title"
      :closeBtn="true"
      ref="window"
      :icon="err ? 'warning' : ''"
      :width="width"
      :height="height"
      :canMax="canMax"
      :iscenter="false"
      :key="'appwindow_' + info.pid"
      @click="active"
    >
      <!-- <mycomputer v-if="info.name == 'Mycomputer'" /> -->
      <folder
        v-if="appData.name == 'Folder'"
        :files="appData.args.data"
        :pid="appData.pid"
        :key="appData.pid"
      />

      <photos
        v-if="appData.name == 'Photos'"
        :file="appData.args.data"
        :pid="appData.pid"
        :key="appData.pid"
      />
      <notepad
        v-if="appData.name == 'Notepad'"
        :file="appData.args.data"
        :content="appData.args.content"
        :pid="appData.pid"
        :key="appData.pid"
        :args="appData.args"
        :shortcut="appData.shortcutData"
      />
      <word
        v-if="appData.name == 'Word'"
        :file="appData.args.data"
        :pid="appData.pid"
        :key="appData.pid"
      />
      <recycle
        v-if="appData.name == 'Recycle'"
        :pid="appData.pid"
        :key="appData.pid"
      />
      <internet-explorer
        v-if="appData.name == 'IE'"
        :pid="appData.pid"
        :key="appData.pid"
      />
      <find
        v-if="appData.name == 'Find'"
        :pid="appData.pid"
        :key="appData.pid"
      />
      <p v-if="err">找不到该应用 {{ appData.name }}</p>
    </window>
  </div>
</template>

<script>
import Window from "../Window.vue";
import Find from "./Find.vue";
import Folder from "./Folder.vue";
import InternetExplorer from "./InternetExplorer.vue";
import Notepad from "./Notepad.vue";
import Photos from "./Photos.vue";
import Recycle from "./Recycle.vue";
import Word from "./Word.vue";
export default {
  components: {
    Window,
    Folder,
    Photos,
    Notepad,
    Word,
    Recycle,
    InternetExplorer,
    Find,
  },
  name: "App",
  props: {
    info: {
      pid: Number,
      name: String,
      args: Object,
      shortcutData: Object,
    },
  },
  data() {
    return {
      title: "",
      icon: "",
      err: false,
      width: 200,
      height: null,
      canMax: false,
      appData: {},
    };
  },
  mounted() {
    try {
      this.appData = JSON.parse(JSON.stringify(this.$props.info));
      this.loadAppInfo();
      this.$store.dispatch("client/setAppWindow", {
        pid: this.info.pid,
        window: this.$refs.window,
      });
      this.$refs.window.show().then((btn) => {
        if (btn == 0) {
          //  关闭app
          this.exit();
        }
      });
    } catch {}
  },
  destroyed() {
    // let appList = this.$store.state.client.runAppList;
    // let lastIndex = appList.length - 1;
    // if (lastIndex >= 0) {
    //   let lastApp = appList[lastIndex];
    //   console.log(lastApp.instance.$refs);
    //   lastApp.instance.$refs.window.click();
    // }
  },
  methods: {
    loadAppInfo() {
      switch (this.$props.info.name) {
        case "Folder":
          if (this.$props.info.args) {
            //  存在参数是打开了文件夹
            this.title = this.$props.info.args.title;
            // this.icon = "folder";
            this.icon = this.$props.info.args.icon
              ? this.$props.info.args.icon
              : "folder_open";
            this.width = 600;
            this.height = 500;
          } else {
            this.title = "我的电脑";
            this.icon = "shortcut/mycomputer";
            this.width = 500;
            this.height = 500;
          }
          this.canMax = true;
          break;
        case "Photos":
          this.title = "照片";
          this.canMax = true;
          this.icon = "photos";
          this.width = 500;
          this.height = 400;

          if (this.$props.info.args) {
            this.title = "照片 - " + this.$props.info.args.subtitle;

            let file = this.$props.info.args.data;
            if (file) {
              if (
                file.indexOf("http://") != -1 ||
                file.indexOf("https://") != -1 ||
                file.indexOf(".webimg") != -1
              ) {
                this.title = "网络照片 - " + this.$props.info.args.subtitle;
                this.icon = "webphoto";
              }
            }
          }

          break;
        case "Notepad":
          this.title = "记事本";
          this.icon = "txt";
          this.width = 500;
          this.height = 600;
          this.shortcutData = this.$props.shortcutData;
          this.canMax = true;

          if (this.$props.info.args) {
            this.title = this.$props.info.args.subtitle + " - 记事本";
          }

          break;
        case "Word":
          this.title = "写字板";
          this.icon = "word";
          this.width = 700;
          this.height = 600;
          this.canMax = true;

          if (this.$props.info.args) {
            this.title = this.$props.info.args.subtitle + " - 写字板（只读）";
          }

          break;
        case "Recycle":
          this.title = "回收站";
          this.icon = "recycle";
          this.width = 500;
          this.height = 350;

          if (this.$props.info.args) {
          }

          break;
        case "IE":
          this.title = "Internet Explorer";
          this.icon = "link";
          this.width = 900;
          this.height = 650;
          this.canMax = true;

          if (this.$props.info.args) {
          }

          break;
        case "Find":
          this.title = "查找文件";
          this.icon = "findapp";
          this.width = 600;
          this.height = 650;
          this.canMax = true;

          if (this.$props.info.args) {
          }

          break;
        default:
          //  找不到
          this.title = "错误";
          this.icon = "warning";
          this.err = true;
      }
    },
    active() {
      var list = this.$store.state.client.runAppList;
      list.forEach((item) => {
        item.active = item.pid == this.info.pid;
      });

      this.$store.dispatch("client/set", {
        runAppList: list,
      });
    },
    /**
     * 结束app
     */
    exit() {
      this.$store.dispatch("client/exitapp", this.$props.info.pid);
    },
  },
};
</script>

<style scoped>
.app {
  position: relative;
}
</style>
