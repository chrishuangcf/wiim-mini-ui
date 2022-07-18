<script setup lang="ts">
  import ToolBar from '../components/ToolBar.vue'
  import AlbumArt from '../components/AlbumArt.vue'
  import Metadata from '../components/Metadata.vue'
</script>

<template>
    <v-container fluid>
      <v-card class="mx-auto">
        <v-card-title>
          <ToolBar :playerStatus="player.status" />
        </v-card-title>
        <AlbumArt :imgUrl="metadata.albumUrl" />
        <Metadata :metadata="metadata" />
      </v-card>
    </v-container>
</template>

<script lang="ts">
  import { MetadataLib } from '../actions/lib'
  const lib = new MetadataLib()

  export default {
    name: 'HomeView',
    data: () => {
      return {
        metadata: {
          albumArtist: '',
          albumTitle: '',
          albumUrl : '',
          songTitle: '',
          songFormat: '',
          songDepth: 0,
          songQuality: '',
          songRate: 0,
          songBitrate: 0,
          artist: '',
          album: '',
          biography: ''
        },
        player: {
          status: 'PAUSED_PLAYBACK'
        },
        timer: 0
      }
    },
    components: { ToolBar, AlbumArt, Metadata },
    created () {
      this.fetchData()
      this.timer = setInterval(this.fetchData, 2000)
    },
    mounted: () => {
    },
    watch: {
    },
    methods: {
      fetchData: async function () {
        await this.fetchDeviceInfo()
        await this.fetchPlayerStatus()
      },
      fetchDeviceInfo: async function () {
        const temp = await lib.fetchDeviceInfo()
        this.metadata = {
          albumArtist: temp.albumArtist,
          albumTitle: temp.albumTitle,
          albumUrl : temp.albumUrl,
          songTitle: temp.songTitle,
          songFormat: temp.songFormat,
          songDepth: temp.songDepth,
          songQuality: '',
          songRate: temp.songRate,
          songBitrate: temp.songBitrate,
          artist: temp.artist,
          album: temp.album,
          biography: temp.biography
        }
      },
      fetchPlayerStatus: async function () {
        this.player = await lib.fetchPlayerStatus('status')
      },
      cancelAutoUpdate () {
          clearInterval(this.timer);
      }
    },
    destroy () {
      this.cancelAutoUpdate();
    }
  }
</script>

<style>
/* @media (min-width: 1024px) {
  .logs {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
} */
</style>
