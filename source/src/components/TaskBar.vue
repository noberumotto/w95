<template>
  <div class="taskbar">
    <start-menu :data="startmenuData" ref="startmenu" />
    <div class="border">
      <btn
        class="btn startbtn"
        v-on:click.native="onShowStartMenu"
        :height="24"
        :width="60"
        ><img class="btnimg" src="@/assets/logo-small.png" /> 开始</btn
      >

      <div class="runing-app">
        <div
          class="item"
          :class="{
            active: app.active,
          }"
          v-for="(app, index) in appList"
          :key="index"
          @click="showApp(app)"
        >
          <div class="grid"></div>
          <div class="icon">
            <img :src="require('../assets/' + app.icon + '.png')" />
          </div>
          <div class="name">{{ app.title }}</div>
        </div>
      </div>

      <div class="notification-bar">
        <div class="notification-border">
          <div class="time">{{ time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Btn from "./Btn.vue";
import StartMenu from "./StartMenu.vue";
import app from "../library/app";

export default {
  components: { Btn, StartMenu },
  name: "TaskBar",
  props: {},
  data() {
    return {
      time: "",
      timer: null,
      startmenuData: [
        {
          title: "应用程序",
          icon: "programs",
          type: "menu",
          showmore: false,
          more: [
            {
              title: "互联网",
              icon: "ie",
              type: "menu",
              command: "ie",
            },
          ],
        },
        {
          title: "查找",
          icon: "findapp",

          type: "menu",
          command: "find",
        },
        {
          title: "文档",
          icon: "documents",

          type: "menu",
          command: "documents",
        },
        {
          type: "line",
        },
        {
          title: "关机",
          type: "menu",
          command: "shutdown",
          icon: "shutdown",
        },
      ],
      appList: [],
    };
  },
  computed: {
    ...mapState(["client"]),
  },
  mounted() {
    this.updateTime();
    this.startTimer();
    this.appList = this.$store.state.client.runAppList;
  },
  methods: {
    showApp(app) {
      app.window.click();
    },
    startTimer() {
      if (this.timer == null) {
        let t = this;
        this.timer = setInterval(() => {
          t.updateTime();
        }, 1000 * 60);
      }
    },
    updateTime() {
      let date = new Date();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      minutes = minutes <= 9 ? "0" + minutes : minutes;
      let range = "下午";
      if (hours >= 1 && hours <= 12) {
        range = "上午";
      }
      this.time = hours + ":" + minutes + " " + range;
    },
    onShowStartMenu() {
      this.$refs.startmenu.show().then((item) => {
        console.log(item);
        switch (item.command) {
          case "shutdown":
            this.$store.dispatch("client/shutdown");
            // window.opener = null;
            // window.open("about:blank", "_top").close();
            break;
          case "documents":
            this.openDocuments();
            break;

          case "ie":
            app.run({ app: "IE" });
            break;
          case "find":
            app.run({ app: "Find" });
            break;
        }
      });
    },
    openDocuments() {
      var data = this.$store.state.client.diskData;
      if (data.length > 0) {
        var disk = data[0];
        if (disk.type != "disk") {
          return;
        }

        var document = disk.args.data.find((item) => item.name == "Documents");

        if (document) {
          app.run({ app: "Folder", args: document.args });
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.startbtn {
  font-weight: bold;
}
.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #c0c0c0;
  box-sizing: border-box;
  text-align: left;
  z-index: 999;
}
.border {
  margin: 1px;
  border: 1px solid #ffffff;
  border-right-color: #656566;
  border-bottom-color: #656566;
  padding: 2px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  .runing-app {
    flex: 1;
    margin-left: 5px;
    display: flex;
    align-items: center;
    overflow: hidden;
    .item {
      border: 1px solid #fdfdfd;
      border-right-color: #8a8a8a;
      border-bottom-color: #8a8a8a;
      box-shadow: 1px 1px 0 0 black;
      margin-right: 3px;
      padding: 0 4px;
      width: 120px;

      height: 24px;
      display: flex;
      align-items: center;
      position: relative;
      box-sizing: border-box;

      .grid {
        position: absolute;
        background: white;
        top: 4px;
        bottom: 1px;
        left: 1px;
        display: none;
        right: 1px;
        background: url("../assets/point.jpg");
        // background-size: 5%;
      }
      .icon {
        display: flex;
        align-items: center;
        z-index: 1;

        img {
          width: 15px;
          height: 15px;
        }
      }
      .name {
        z-index: 1;
        color: #000;
        margin-left: 5px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .active {
      border: 1px solid #8a8a8a;
      border-right-color: #fdfdfd;
      border-bottom-color: #fdfdfd;
      box-shadow: inset 1px 1px 2px 0 black !important;
      background: white;
      .grid {
        display: block;
      }
      .name {
        font-weight: bold;
      }
    }
  }
}
.btn {
  width: auto;
}
.btnimg {
  height: 16px;
  margin-right: 2px;
}
.notification-bar {
  background: #b4b4b4;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
}
.notification-border {
  border: 1px solid #6d6d6d;
  border-right-color: #ffffff;
  box-sizing: border-box;
  border-bottom-color: #ffffff;
  display: flex;
  align-items: center;
}
.time {
  margin: 0 10px;
}
</style>
