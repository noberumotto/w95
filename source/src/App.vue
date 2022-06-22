<template>
  <div id="app">
    <canvas class="grid_canvas" ref="canvas"></canvas>
    <router-view />
  </div>
</template>
<script>
import { mapState } from "vuex";
import time from "./library/time";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["client"]),
  },
  mounted() {
    this.drawGrid();
    window.onresize = () => {
      this.drawGrid();
    };
  },
  methods: {
    drawGrid() {
      this.$nextTick(() => {
        var browserWidth = window.innerWidth;
        var browserHeight = window.innerHeight;

        var canvas = this.$refs.canvas;
        canvas.width = browserWidth;
        canvas.height = browserHeight;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.fillStyle = "#FF0000";
        ctx.fillRect(10, 10, 2, 2);
        let w = browserWidth / 2;
        let h = browserHeight / 2;
        for (let wi = 0; wi < w; wi++) {
          for (let hi = 0; hi < h; hi++) {
            ctx.fillRect(wi * 2, hi * 2, 1, 1);
          }
        }
      });
    },
  },
};
</script>
<style lang="scss">
* {
  box-sizing: border-box;
  font-family: "宋体";
  outline: none;
  // font-size: 12px;
  /* font-family: "simsun" !important; */
}
*:not(h1,h2,h3,h4){
  font-size: 12px;
}
@font-face {
  font-family: "simsun";
  src: url("assets/simsun.ttf");
}
@font-face {
  font-family: "dos";
  src: url("assets/dos.ttf");
}
#app {
  /* font-family: "simsun" !important; */
  // -webkit-font-smoothing: antialiased;
  // -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #2c3e50;
  font-size: 12px;
  background: black;
}
input {
  outline: none;
}

.grid_canvas {
  position: fixed;
  background: transparent;
  left: 0;
  top: 0;
  opacity: 0.2;
  pointer-events: none;
  z-index: 9999;
}

.menu-bar {
  display: flex;
  align-items: center;
  margin-top: 1px;
  .item {
    padding: 2px 6px;
    text-align: center;
    label {
      text-decoration: underline;
    }
  }
  .item:hover {
    background: #0000aa;
    color: #ffffff;
  }
}
.window-border {
  flex: 1;
  border: 1px solid #6d6d6d;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
}
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .app-main {
    height: 100%;
    background: #ffffff;
    border: 1px solid #6d6d6d;
    border-right-color: #ccc;
    border-bottom-color: #ccc;
    /* margin: 1px; */
    display: flex;
    align-items: flex-start;
    /* flex-direction: column; */
    flex-wrap: wrap;
    align-content: flex-start;
  }
}
hr {
  margin: 14px 0;
}
.mainborder {
  border: 1px solid #6d6d6d;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
  box-shadow: inset 1px 1px 0 0 black;
  box-sizing: border-box;
}
.mainoutborder {
  border: 1px solid #ffffff;
  border-right-color: #6d6d6d;
  border-bottom-color: #6d6d6d;
  box-sizing: border-box;
  box-shadow: 1px 1px 0 0 black;
}
.bg-gray {
  background: #c0c7c8;
}
.inputbox {
  background: #ffffff;
  border: 1px solid #6d6d6d;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
  box-shadow: inset 1px 1px 0 0 black;
  padding: 2px 3px;
  width: 100%;
}

.wordpad {
  p {
    line-height: 2em;
    margin: 5px 0;
    code {
      background: #c0c7c8;
      border: 1px solid #6d6d6d;
      border-right-color: #ffffff;
      border-bottom-color: #ffffff;
      box-shadow: 1px 1px 0 0 black;
      box-sizing: border-box;
      padding: 2px 4px;
      margin: 0 5px;
      color: #414040;
    }
  }
  pre {
    background: #ffffd5;
    border: 1px solid #414040;
    padding: 10px;
    box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.308);
    code {
    }
  }
}
</style>
