<template>
  <div
    class="framework"
    ref="framework"
    :class="{
      shutdown: shutdown,
    }"
  >
    <div class="light_masklayer"></div>
    <div class="login" v-if="!islogin">
      <window
        :title="'欢迎登录'"
        :width="500"
        :height="150"
        :icon="'key'"
        ref="loginWindow"
        :helpBtn="true"
        :iscenter="true"
      >
        <div class="login-panel">
          <div class="icon"><img src="../assets/key.png" /></div>
          <div class="login-input">
            <p>
              {{
                config.loginQuestion ? config.loginQuestion : "请输入登录密码"
              }}
            </p>
            <div class="item">
              口令:<text-box
                style="margin-left: 20px"
                v-model="loginData.key"
              />
            </div>
          </div>
          <div class="login-btns">
            <div>
              <btn v-on:click.native="login" :width="100" :height="25"
                >确定</btn
              >
            </div>
            <div style="margin-top: 5px">
              <btn v-on:click.native="cancel" :width="100" :height="25"
                >取消</btn
              >
            </div>
          </div>
        </div>
      </window>
    </div>

    <div class="desktop" v-if="islogin">
      <desktopcontainer />
      <task-bar />
    </div>
    <audio
      ref="audio"
      src="@/assets/win95.mp3"
      preload
      id="audio"
      muted
    ></audio>
  </div>
</template>
<script>
import Btn from "../components/Btn.vue";
import TextBox from "../components/TextBox.vue";
import Window from "../components/Window.vue";
import { mapState } from "vuex";
import { startupMusic } from "../assets/win95.mp3";
import TaskBar from "../components/TaskBar.vue";
import Desktopcontainer from "../components/Desktopcontainer.vue";
import config from "../config";

export default {
  components: { Window, Btn, TextBox, TaskBar, Desktopcontainer },
  data() {
    return {
      loginData: {
        key: "",
      },
      config: config,
      islogin: false,
      shutdown: false,
    };
  },
  computed: {
    ...mapState(["client"]),
  },
  watch: {
    "$store.state.client.isShutdown": {
      handler: function (val) {
        // console.log("shutdown:" + val);
        this.onShutdown();
      },
    },
    shutdown: function (val) {
      if (val) {
        setTimeout(() => {
          window.opener = null;
          window.open("about:blank", "_top").close();
        }, 1500);
      }
    },
  },
  mounted() {
    if (config.loginPassword) {
      var timer = setTimeout(() => {
        clearTimeout(timer);
        this.$refs.loginWindow.show();
      }, 1500);
    } else {
      this.loginPass();
    }
  },
  methods: {
    startupMusic() {
      new Audio(startupMusic).play();
      // console.log(startupMusic);
    },
    cancel() {
      this.$store.dispatch("client/shutdown");
    },
    onShutdown() {
      var runAppList = this.$store.state.client.runAppList;

      if (runAppList.length > 0) {
        //  关闭应用
        // var app = runAppList[0];
        // this.$store.dispatch("client/exitapp", app.pid);
        var appcount = runAppList.length;
        var i = 0;
        var timer = setInterval(() => {
          // var runAppList = this.$store.state.client.runAppList;
          if (i == appcount) {
            clearInterval(timer);
            this.shutdown = true;
          } else {
            var app = runAppList[i];
            app.window.toMin();
            i++;
            // this.$store.dispatch("client/exitapp", app.pid);
          }
        }, 500);
      } else {
        this.shutdown = true;
      }
      // this.$store.dispatch("client/shutdown");
      // window.opener = null;
      // window.open("about:blank", "_top").close();
    },
    login() {
      // console.log(this.$store.state.client.windowList);
      if (this.loginData.key !== config.loginPassword) {
        this.$msgbox({
          title: "提示",
          icon: "error",
          content: "请输入正确的口令！",
        });
      } else {
        this.loginPass();
      }
    },
    loginPass() {
      this.islogin = true;
      this.$refs.loginWindow.close();
      this.$refs.audio.play();
      this.$store.dispatch("client/set", {
        windowList: [],
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.shutdown {
  .light_masklayer {
    animation: shutdown 1s forwards;
  }
}
@keyframes shutdown {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.light_masklayer {
  pointer-events: none;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3210;
  background: #000000;
  animation: light 1s forwards;
}
.framework {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #57a8a8;
  box-shadow: inset 0 0 100px 35px rgba(0, 0, 0, 0.2);
}
@keyframes light {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.desktop {
  width: 100%;
  height: 100%;
  position: relative;
}
.login-panel {
  display: flex;
  justify-content: space-between;
  flex: 1;
  padding: 10px;
}
.login-panel .icon {
  text-align: center;
  width: 15%;
}
.login-input {
  text-align: left;
  width: 54%;
}
.login-input p {
  margin: 0;
}
.login-input .item {
  display: flex;
  align-items: center;
  margin-top: 20px;
}
</style>