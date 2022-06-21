<template>
  <div class="folderitem" v-if="data.type == 'disk' || data.type == 'folder'">
    <div class="line2"></div>
    <div
      class="folder"
      :class="{
        selected: data.selected,
      }"
    >
      <div @click="exp" class="exp">
        <img
          v-if="!isExp && isCanExp(data.args.data)"
          src="../../assets/exp.png"
        />
        <img
          v-if="isExp && isCanExp(data.args.data)"
          src="../../assets/exp2.png"
        />
      </div>
      <div class="line"></div>
      <div class="icon" @click="select(data)">
        <img v-if="data.type == 'folder'" src="../../assets/folder.png" />
        <img
          v-if="data.icon"
          :src="require('../../assets/' + data.icon + '.png')"
        />
      </div>
      <div class="name" @click="select(data)">{{ data.name }}</div>
    </div>
    <div class="subfolders" v-if="data.args.data.length > 0 && isExp">
      <folder-item
        v-for="item in data.args.data"
        :data="item"
        :key="item.name"
        v-on:selected="select"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Btn from "../Btn.vue";

import Window from "../Window.vue";
export default {
  components: { Window, Btn },
  name: "FolderItem",
  props: {
    data: Object | Array,
  },
  data() {
    return {
      isExp: false,
    };
  },
  computed: {
    ...mapState(["client"]),
  },
  mounted() {},
  methods: {
    select(item) {
      this.$emit("selected", item);
    },
    exp() {
      this.isExp = !this.isExp;
    },
    isCanExp(data) {
      return data.find((item) => item.type == "folder" || item.type == "disk");
    },
  },
};
</script>

<style lang="scss" scoped>
.selected {
  .name {
    background: #0000a8;
    color: #fff;
    border: 1px dotted #fff !important;
  }
}
.folderitem {
  position: relative;

  .line2 {
    top: 0;
    position: absolute;
    bottom: 10px;
    width: 1px;
    left: 2%;
    border-left: 1px dotted #000;
    // background: red;
  }

  .folder {
    display: flex;
    align-items: center;
    margin: 5px 0;
    position: relative;
    .line {
      position: absolute;
      left: 5px;
      right: 92%;
      height: 1px;
      border-top: 1px dotted #000;
    }
    .exp,
    .icon {
      display: flex;
      align-items: center;
    }
    .exp {
      width: 12px;
      img {
        // width: 14px;
        // height: 14px;
      }
    }

    .icon {
      margin-left: 10px;
      // margin-right: 8px;
      img {
        height: 16px;
        margin-right: 8px;
      }
    }
    .name{
      border: 1px solid transparent;
      padding: 2px;
    }
  }
}
.subfolders {
  margin-left: 10%;
}
</style>
