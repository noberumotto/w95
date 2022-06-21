<template>
  <div class="contextmenu" v-show="isShow" ref="contextmenu">
    <div class="menu-item" v-for="(item, index) in data" :key="index">
      <div
        class="item menu"
        v-if="item.type == 'menu' && !item.disabled"
        v-on:click.stop="onClick(item)"
        @mouseenter="onEnter(index)"
        @mouseleave="onLeave"
      >
        <div class="icon menu">
          
          <div class="check" v-if="item.checked">·</div>
        </div>
        <div
          class="title menu"
          :style="{
            color: hoverIndex == index ? '#ffffff' : '#000',
          }"
        >
          {{ item.title }}
        </div>
        <div class="mark" v-if="item.menus">
          <img
            v-show="hoverIndex == index"
            :src="require('../assets/right_white.png')"
          />
          <img
            v-show="hoverIndex != index"
            :src="require('../assets/right.png')"
          />
          <div class="submenus" v-if="hoverIndex == index">
            <context-menu
              :defaultShow="true"
              :data="item.menus"
              @click="submenuClick"
            />
          </div>
        </div>
      </div>
      <div class="disabled-item" v-if="item.disabled">
        <div class="icon">
        
        </div>
        <div class="title">{{ item.title }}</div>
        <div class="mark"></div>
      </div>

      <div class="splitline" v-if="item.type == 'line'"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContextMenu",
  props: {
    data: {
      type: Array,
      default: [],
    },
    defaultShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShow: false,
      mouseX: 0,
      mouseY: 0,
      hoverIndex: -1,
    };
  },
  mounted() {
    let t = this;
    this.isShow = this.defaultShow;
    // window.onmousedown = () => {
    //   this.hide();
    // };
  },
  watch: {
    isShow: function (val) {
      this.$emit("state", val ? "show" : "hide");
    },
  },
  methods: {
    submenuClick(item) {
      this.onClick(item);
    },
    onEnter(index) {
      this.hoverIndex = index;
    },
    onLeave() {
      this.hoverIndex = -1;
    },
    onMouseDown(ev) {
      if (ev.target.className.indexOf("menu") == -1) {
        this.hide();
      }
      window.removeEventListener("mousedown", this.onMouseDown);
    },
    onMouseEvent(ev) {
      this.isShow = false;
      this.mouseX = ev.clientX;
      this.mouseY = ev.clientY;
      window.removeEventListener("onmousedown", this.onMouseEvent);
    },
    onClick(item) {
      if (!this.defaultShow) {
        this.hide();
      }
      // this.resolve(item);
      this.$emit("click", item);
    },
    showinmouse() {
      return this.show({
        clientX: this.mouseX,
        clientY: this.mouseY,
      });
    },
    hide() {
      this.isShow = false;
    },
    show(ev) {
      // this.promise = new Promise((resolve, reject) => {
      //   this.resolve = resolve;
      //   this.reject = reject;
      // });
      if (this.isShow) {
        this.isShow = false;
        // return this.promise;
      }
      let contextmenu = this.$refs.contextmenu;
      if (!contextmenu) {
        return;
      }

      contextmenu.style.left = ev.clientX + 5 + "px";
      contextmenu.style.top = ev.clientY + 5 + "px";

      this.isShow = true;

      setTimeout(() => {
        window.addEventListener("mousedown", this.onMouseDown);
      }, 50);
      // console.log("show");
      // var timer = setTimeout(() => {
      //   clearTimeout(timer);
      // this.onlistenmouse();
      // }, 500);
      // return this.promise;
    },
  },
};
</script>

<style lang="scss" scoped>
.contextmenu {
  display: inline-block;
  position: fixed;
  border: 1px solid #ffffff;
  border-right-color: #6d6d6d;
  border-bottom-color: #6d6d6d;
  background: #b4b4b4;
  box-shadow: 1px 2px 0 0 black;
  box-sizing: border-box;
  min-width: 138px;
  z-index: 8;
}
.menu-item {
  box-sizing: border-box;
  padding: 1px;
}
.item:hover {
  background: #0000aa;
  color: #ffffff;
}
.item:active {
  background: #7e7e8d;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
  box-sizing: border-box;
}
.disabled-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
  box-sizing: border-box;
  color: #868a8e;
}
.icon {
  width: 30px;

  .check {
    font-size: 20px;
    font-weight: bold;
    height: 10px;
    display: flex;
    align-items: center;
  }
}
.title {
  flex: 1;
  text-align: left;
}
.mark {
  width: 30px;
  position: relative;
  img {
    width: 12px;
    height: 12px;
  }
  .submenus {
    position: absolute;
    left: 92%;
    top: -27%;
  }
}
.splitline {
  height: 1px;
  width: 100%;
  margin: 3px 0;
  background: #8d9194;
  border-top: 1px solid #8d9194;

  border-bottom: 1px solid #ffffff;
  box-sizing: border-box;
}
</style>
