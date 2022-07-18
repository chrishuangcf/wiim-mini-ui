<template>
  <v-card
    color="transparent"
    flat
    tile
  >
    <v-toolbar collapse>
      <v-btn icon>
        <v-icon>mdi-skip-previous</v-icon>
      </v-btn>
      <v-btn icon v-if="playerStatus === 'PAUSED_PLAYBACK'">
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-btn icon v-if="playerStatus === 'PLAYING'">
        <v-icon>mdi-pause</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-skip-next</v-icon>
      </v-btn>
    </v-toolbar>
  </v-card>
</template>

<script lang="ts">
  export default {
    name: 'ToolBar',
    props: ['playerStatus'],
    data: () => ({}),
    mounted: function () {
    },
    watch: {
    },
    methods: {
    }
  }
</script>
// PAUSED_PLAYBACK, PLAYING, TRANSITIONING
