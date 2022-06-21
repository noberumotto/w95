<template>
  <div
    class="window"
    ref="window"
    v-show="isshow"
    v-if="isrender"
    v-bind:style="{
      width: width
        ? (width > browserWidth ? browserWidth - 50 : width) + 'px'
        : 'auto',
      height: height
        ? (height > browserHeight ? browserHeight - 50 : height) + 'px'
        : 'auto',
      zIndex: isDialog ? 9999 : 0,
    }"
    :class="{
      min: isMin,
      show: isShowAnimation,
    }"
  >
    <div class="border">
      <div class="header bold" ref="titlebar">
        <div class="left" v-on:dblclick="toMax">
          <div class="titleicon">
            <img
              :src="require('../assets/' + titleIcon + '.png')"
              v-if="titleIcon"
            />
          </div>
          <div class="title">
            {{ title.length > 25 ? title.substring(0, 22) + "..." : title }}
          </div>
        </div>
        <div class="right">
          <btn v-if="helpBtn" :width="20" :height="20">?</btn>
          <btn
            class="btn"
            v-if="minBtn"
            v-on:click.native="clickBtn(2)"
            :width="20"
            :height="20"
          >
            <img src="../assets/min.png" />
          </btn>
          <btn
            class="btn"
            v-if="!isMax && canMax"
            v-on:click.native="clickBtn(1)"
            :width="20"
            :height="20"
          >
            <img src="../assets/max.png" />
          </btn>
          <btn
            class="btn"
            v-if="isMax"
            v-on:click.native="clickBtn(1)"
            :width="20"
            :height="20"
          >
            <img src="../assets/resize.png" />
          </btn>
          <btn
            class="btn"
            v-if="closeBtn"
            v-on:click.native="clickBtn(0)"
            :width="20"
            :height="20"
            :key="'wbtn_0_' + wid"
            >×</btn
          >
        </div>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Btn from "./Btn.vue";
export default {
  components: { Btn },
  name: "Window",
  props: {
    title: String,
    // icon: String,
    //  标题栏图标
    titleIcon: String,
    closeBtn: Boolean,
    helpBtn: Boolean,
    width: Number,
    height: Number,
    canMax: {
      type: Boolean,
      default: false,
    },
    iscenter: {
      type: Boolean,
      default: false,
    },
    isMainWindow: {
      type: Boolean,
      default: false,
    },
    isDialog: {
      type: Boolean,
      default: false,
    },
    minBtn: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState(["client"]),
  },
  data() {
    return {
      //  窗口唯一ID
      wid: 0,
      img: "",
      browserWidth: 0,
      browserHeight: 0,
      isshow: false,
      isrender: true,
      isCap: false,
      isMax: false,
      x: "",
      y: "",
      lastTopWindow: {},
      isMin: false,
      isShowAnimation: false,
    };
  },
  mounted() {
    this.browserWidth = window.innerWidth;
    this.browserHeight = window.innerHeight;

    this.$nextTick(() => {
      this.init();
    });
  },
  destroyed() {
    let list = this.$store.state.client.windowList;
    list.forEach((item, index) => {
      if (item.wid == this.wid) {
        list.splice(index, 1);
      }
    });

    this.$store.dispatch("client/set", {
      windowList: list,
    });

    var topWindow = this.lastTopWindow;
    if (!topWindow.window && list && list.length > 0) {
      topWindow = list[0];
    }

    if (topWindow.window) {
      topWindow.window.click();
    }
  },
  methods: {
    init() {
      let window = this.$refs.window;

      if (!window) {
        return;
      }
      let titlebar = this.$refs.titlebar;
      let t = this;

      //  窗口尺寸
      let windowRect = window.getBoundingClientRect();
      let windowWidth = this.width > 0 ? this.width : windowRect.width;
      let windowHeight = this.height > 0 ? this.height : windowRect.height;
      //  调整窗口位置居中

      let list = this.client.windowList;

      if (list.length < 1 || this.iscenter) {
        window.style.left = this.browserWidth / 2 - windowWidth / 2 + "px";
        window.style.top = this.browserHeight / 2 - windowHeight / 2 + "px";
      } else {
        let lastWindowRect = list[list.length - 1].el.getBoundingClientRect();

        window.style.left = lastWindowRect.x + 20 + "px";
        window.style.top = lastWindowRect.y + 20 + "px";
      }
      window.onmousedown = function (ev) {
        t.click();
        // t.$emit("click");
        ev.stopPropagation();
      };
      //  设置拖拽
      let diffX, diffY;
      titlebar.onmousedown = function (ev) {
        //  不是左键点击不处理
        if (
          ev.button != 0 ||
          (ev.target.className != "title" &&
            ev.target.className != "header" &&
            ev.target.className != "left")
        ) {
          return;
        }

        if (titlebar.setCapture) {
          titlebar.setCapture();
        }

        t.isCap = true;
        diffX = ev.clientX - window.offsetLeft;
        diffY = ev.clientY - window.offsetTop;
      };

      window.onmousemove = function (ev) {
        if (!t.isCap) {
          return;
        }

        window.style.left = ev.clientX - diffX + "px";
        window.style.top = ev.clientY - diffY + "px";
      };
      window.onmouseup = function (ev) {
        t.isCap = false;
        // document.onmousemove = document.onmouseup = null;
        if (titlebar.releaseCapture) {
          titlebar.releaseCapture();
        }
      };

      this.windowOpen();
    },
    windowOpen() {
      let list = this.$store.state.client.windowList;
      let wid = list.length + 1;
      this.wid = wid;
      let window = {
        wid: wid,
        el: this.$refs.window,
        window: this,
        isDialog: this.isDialog,
        zIndex: 0,
      };
      list.push(window);
      this.$store.dispatch("client/set", {
        windowList: list,
      });
    },
    click() {
      if (this.$el.style.display == "none") {
        return;
      }
      this.$emit("click");
      if (this.isMin) {
        this.isMin = false;
        this.isShowAnimation = true;
      }
      let wid = this.wid;
      let list = this.$store.state.client.windowList;

      var focusWindow = list.find((item) => item.isDialog);
      if (focusWindow) {
        list.forEach((item) => {
          item.el.style.zIndex = 1;
          item.zIndex = 1;
          item.el.classList.add("deactivated");
          item.el.classList.add("disabled");
          item.el.firstChild.firstChild.style.background = "#808080";
          item.el.firstChild.firstChild.style.color = "#b4b4b4";
        });

        focusWindow.el.style.zIndex = 13;
        focusWindow.zIndex = 13;
        focusWindow.el.classList.remove("deactivated");
        focusWindow.el.classList.remove("disabled");
        focusWindow.el.firstChild.firstChild.style.background = "#0000aa";
        focusWindow.el.firstChild.firstChild.style.color = "#ffffff";
      } else {
        list.map((item) => {
          if (item.wid == wid) {
            if (!item.isactive) {
              item.zIndex++;
              item.el.style.zIndex = item.zIndex;
              item.isactive = true;
            }
            item.el.classList.remove("deactivated");
            item.el.firstChild.firstChild.style.background = "#0000aa";
            item.el.firstChild.firstChild.style.color = "#ffffff";
          } else {
            if (item.isactive) {
              item.zIndex--;
              if (item.zIndex < 1) {
                item.zIndex = 1;
              }
              item.el.style.zIndex = item.zIndex;
              item.isactive = false;

              this.lastTopWindow = item;
            }

            item.el.classList.add("deactivated");
            item.el.firstChild.firstChild.style.background = "#808080";
            item.el.firstChild.firstChild.style.color = "#b4b4b4";
          }
        });
        this.$store.dispatch("client/set", {
          windowList: list,
        });
      }
    },
    onBtnClick(btnNumber) {
      if (this.btnClickCallback) {
        this.btnClickCallback(btnNumber);
      } else {
        this.close();
      }
    },
    hide() {
      this.isshow = false;

      let list = this.$store.state.client.windowList;
      list.forEach((item) => {
        item.el.classList.remove("disabled");
      });
    },
    close() {
      this.isshow = false;

      //  清除渲染
      this.isrender = false;
    },
    clickBtn(btn) {
      if (btn == 0) {
        this.hide();
        this.resolve(btn);
      } else if (btn == 1) {
        this.toMax();
      } else if (btn == 2) {
        this.toMin();
      }
    },
    show() {
      this.isshow = true;
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
      this.$nextTick(() => {
        this.click();
      });
      return this.promise; //返回promise对象,给父级组件调用
    },
    toMin() {
      this.isMin = true;
      this.isShowAnimation = false;
    },
    toMax() {
      if (!this.$props.canMax) {
        return;
      }
      let window = this.$refs.window;
      if (this.isMax) {
        //  还原
        window.style.left = this.x;
        window.style.top = this.y;
        window.style.width = this.$props.width
          ? this.$props.width + "px"
          : "auto";
        window.style.height = this.$props.height
          ? this.$props.height + "px"
          : "auto";
      } else {
        //  最大化

        //  保存状态
        this.x = window.getBoundingClientRect().left + "px";
        this.y = window.getBoundingClientRect().top + "px";

        window.style.left = 0;
        window.style.top = 0;
        window.style.width = this.browserWidth + "px";
        window.style.height = this.browserHeight - 30 + "px";
      }
      this.isMax = !this.isMax;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.deactivated {
  .header {
    background: #808080;
    color: #b4b4b4;
  }
}
.disabled {
  pointer-events: none;
}
.bold {
  font-weight: bold !important;
}
.window {
  position: fixed;
  background: #c0c7c8;
  box-shadow: 2px 3px 0 0 black;
  min-width: 300px;
  box-sizing: border-box;

  .border {
    display: flex;
    flex-direction: column;
    .content {
      flex: 1;
    }
  }
}
.min {
  animation: min 0.5s forwards;
}
.show {
  animation: show 0.5s forwards;
}
@keyframes show {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}
@keyframes min {
  0% {
    transform: scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleY(0);
    opacity: 0;
  }
}
.border {
  margin: 1px;
  border: 1px solid #ffffff;
  border-right-color: #656566;
  border-bottom-color: #656566;
  padding: 2px;
  height: 100%;
  box-sizing: border-box;
  box-shadow: 0 0 55px 15px rgba(193, 255, 255, 0.8);
  /* box-shadow: 0 0 55px 15px rgba(104, 237, 237, 0.8); */
}
.header {
  background: #0000aa;
  color: #ffffff;
  padding: 2px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 2px;
}
.left {
  flex: 1;
  text-align: left;
  display: flex;
  align-items: center;
  // .title{
  //   color: red;
  //   width: 50%;
  // }
}
.right {
  display: flex;
}
.content {
  /* padding: 10px; */
  /* display: flex; */
  /* height: 100%; */
}
.icon {
  margin-right: 20px;
}
.titleicon {
  display: flex;
  align-items: center;
  img {
    height: 16px;
    margin-right: 5px;
  }
}
</style>
