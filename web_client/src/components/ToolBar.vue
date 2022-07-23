<template>
  <div color="#424242" dark prominent class="justify-space-around">
    <v-btn-toggle rounded="lg" class="py-2" color="#607D8B" dark size="xs">
      <v-btn icon v-on:click="handleShowDevices()"
        ><v-icon>mdi-speaker-wireless</v-icon></v-btn
      >
      <v-btn
        icon
        v-if="playerStatus === 'PAUSED_PLAYBACK'"
        v-on:click="handleClick('Play')"
      >
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-btn
        icon
        v-if="playerStatus === 'PLAYING'"
        v-on:click="handleClick('Pause')"
      >
        <v-icon>mdi-pause</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon v-on:click="handleClick('Next')">mdi-skip-next</v-icon>
      </v-btn>
    </v-btn-toggle>
    <v-spacer></v-spacer>
  </div>
</template>

<script lang="ts">
export default {
  name: "ToolBar",
  props: ["playerStatus"],
  data: () => ({
    toggle: false,
  }),
  mounted: function () {},
  watch: {},
  methods: {
    handleClick(action: string) {
      this.$emit("player", action);
    },
    handleShowDevices() {
      this.toggle = !this.toggle;
      this.$emit("showDevices", this.toggle);
    },
  },
};
</script>
