<template>
  <v-row dense>
    <v-col align-self="center">
      <div
        color="#424242"
        dark
        prominent
        style="position: absolute; bottom: 0px; width: 100%"
      >
        <v-btn-toggle rounded="lg" class="py-2" color="#607D8B" dark size="xs">
          <v-btn icon v-on:click="handleToggleSetup()"
            ><v-icon>mdi-cog</v-icon></v-btn
          >
          <v-btn icon v-on:click="handleShowDevices()"
            ><v-icon>mdi-speaker-wireless</v-icon></v-btn
          >
          <v-btn
            icon
            v-if="playerStatus === 'TRANSITIONING' && seletedRenderer"
          >
            <v-icon>mdi-timer-sand</v-icon>
          </v-btn>
          <v-btn
            icon
            v-if="playerStatus === 'PAUSED_PLAYBACK' && seletedRenderer"
            v-on:click="handleClick('Play')"
          >
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn
            icon
            v-if="playerStatus === 'PLAYING' && seletedRenderer"
            v-on:click="handleClick('Pause')"
          >
            <v-icon>mdi-pause</v-icon>
          </v-btn>
          <v-btn icon v-if="seletedRenderer">
            <v-icon v-on:click="handleClick('Next')">mdi-skip-next</v-icon>
          </v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "ToolBar",
  props: ["playerStatus", "seletedRenderer"],
  data: () => ({
    toggleDevices: false,
    toggleServerUrl: false,
  }),
  mounted: function () {},
  methods: {
    handleClick(action: string) {
      this.$emit("player", action);
    },
    handleShowDevices() {
      this.toggleDevices = !this.toggleDevices;
      this.$emit("showDevices", this.toggleDevices);
    },
    handleToggleSetup() {
      this.toggleServerUrl = !this.toggleServerUrl;
      this.$emit("showServerUrl", this.toggleServerUrl);
    },
  },
};
</script>
