<template>
  <div class="btn">
    <div class="button">
      <div
        class="border"
        v-bind:style="{
          width: width ? width + 'px' : 'auto',
          height: height ? height + 'px' : 'auto',
        }"
      >
        <div
          class="inborder"
          :style="{
            width: width ? width - 5 + 'px' : 'auto',
            height: height ? height - 5 + 'px' : 'auto',
          }"
        >
          <label>
            <slot></slot>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Btn",
  props: {
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  display: inline-block;
  // background: #b4b4b4;
  background: #c0c7c8;
  box-shadow: 1px 1px 0 0 black;
  box-sizing: border-box;
  /* position: relative; */
  /* width: 100px;
  height: 27px; */
}
.btn {
  border: 1px solid rgba(0, 0, 0, 0);
}
.btn:active {
  border: 1px solid #000;
  .inborder {
    border: 1px dotted black;
    label {
      animation: click 0.1s forwards;
    }
  }
}
@keyframes click {
  0% {
    margin: 0;
  }

  100% {
    margin-left: 2px;
    margin-top: 1px;
  }
}
.inborder {
  border: 1px dotted transparent;
  label {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.border {
  /* margin: 1px; */
  border: 1px solid #ffffff;
  border-right-color: #8a8a8a;
  border-bottom-color: #8a8a8a;
  /* position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; */

  color: black;
  /* font-weight: bold; */
  box-sizing: border-box;
  padding: 2px;
}
.button:active {
  background: #9f9f9f;
}
.disabled {
  border: 1px solid #000;
  label {
    color: #999 !important;
  }
}
</style>
