<template>
  <canvas ref="canvas" />
</template>
<script>
export default {
  name: "BadImage",
  props: {
    src: String,
    width: {
      type: Number,
      default: 50,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      imageObj: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.imageObj = new Image();
      this.imageObj.onload = () => {
        let canvas = this.$refs.canvas;

        let rate = this.width / this.imageObj.width;
        canvas.width = this.width;
        canvas.height =
          this.height == 0 ? rate * this.imageObj.height : this.height;

        let ctx = canvas.getContext("2d");
        let imgarr = [];
        for (let i = 0; i < canvas.width * canvas.height; i++) {
          imgarr.push(i);
        }

        let arr = [];
        for (let i = 0; i < imgarr.length / 20; i++) {
          arr.push(imgarr.splice(imgarr.length * Math.random(), 1));
        }

        ctx.drawImage(this.imageObj, 0, 0, canvas.width, canvas.height);

        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < canvas.width * canvas.height; i++) {
          imgData.data[0.1 * imgarr[i] + 10] = 120;
          imgData.data[0.4 * imgarr[i] + 1] = 125;
          imgData.data[20 * imgarr[i] + 5] = parseInt(Math.random() * 125);
          imgData.data[4 * imgarr[i] + 1] = 110;
        }
        ctx.putImageData(imgData, 0, 0);
      };
      this.imageObj.src = this.src;
    });
  },
};
</script>


<style scoped>
</style>