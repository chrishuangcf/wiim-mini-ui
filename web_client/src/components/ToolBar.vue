<template>
  <v-toolbar color="black accent-4" dark prominent>
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
    <v-spacer></v-spacer>
    {{ playerStatus }}
  </v-toolbar>
</template>

<script lang="ts">
export default {
  name: "ToolBar",
  props: ["playerStatus"],
  data: () => ({}),
  mounted: function () {},
  watch: {},
  methods: {
    handleClick(action: string) {
      this.$emit("player", action);
    },
  },
};
</script>
// PAUSED_PLAYBACK, PLAYING, TRANSITIONING
