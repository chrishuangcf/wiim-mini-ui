<script setup lang="ts">
import ToolBar from "@/components/ToolBar.vue";
import AlbumArt from "@/components/AlbumArt.vue";
import SongSpecs from "@/components/SongSpecs.vue";
</script>

<template>
  <v-card class="mx-auto">
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <v-card color="#424242" theme="dark">
            <div class="d-flex flex-no-wrap justify-space-between">
              <v-col cols="6">
                <v-avatar size="100%" rounded="0">
                  <AlbumArt :imgUrl="metadata.albumUrl" />
                </v-avatar>
              </v-col>
              <v-col cols="6">
                <v-card color="#263238">
                  <v-card-title class="text-h5 text--primary">
                    {{ metadata.songTitle }}
                  </v-card-title>
                  <v-card-text>
                    <p class="text-h text--primary">
                      {{ metadata.albumTitle }}
                    </p>
                  </v-card-text>
                  <v-card-text>
                    <v-btn
                      rounded="lg"
                      color="#37474F"
                      v-on:click="fetchArtistBio"
                    >
                      {{ metadata.artist }}
                    </v-btn>
                  </v-card-text>
                  <v-card-text v-if="toggles.bio">
                    {{ artistBio }}
                    <div
                      class="d-flex justify-space-around align-center flex-column flex-sm-row"
                    >
                      <v-btn height="25" variant="outlined" color="#78909C">
                        wiki
                      </v-btn>
                      <v-btn height="25" variant="outlined" color="#78909C">
                        wiki
                      </v-btn>
                      <v-btn height="25" variant="outlined" color="#78909C">
                        wiki
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
                <SongSpecs
                  :song="metadata.songTitle"
                  :streamSource="metadata.streamSource"
                  :songDepth="metadata.songDepth"
                  :songRate="metadata.songRate"
                  :songBitrate="metadata.songBitrate"
                  :songQuality="metadata.songQuality"
                />
              </v-col>
            </div>
          </v-card>
          <ToolBar :playerStatus="player.status" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { MetadataLib } from "../actions/lib";
const lib = new MetadataLib();

export default {
  name: "HomeView",
  data: () => {
    return {
      metadata: {
        albumArtist: "",
        albumTitle: "",
        albumUrl: "",
        songTitle: "",
        songFormat: "",
        songDepth: 0,
        songQuality: "",
        songRate: 0,
        songBitrate: 0,
        artist: "",
        album: "",
        biography: "",
        streamSource: "",
      },
      player: {
        status: "PAUSED_PLAYBACK",
      },
      artistBio: "",
      toggles: {
        bio: false,
      },
      timer: 0,
    };
  },
  components: { ToolBar, AlbumArt, SongSpecs },
  created() {
    this.fetchData();
    this.timer = setInterval(this.fetchData, 1000);
  },
  mounted: () => {},
  watch: {},
  methods: {
    fetchData: async function () {
      await this.fetchDeviceInfo();
      await this.fetchPlayerStatus();
    },
    fetchDeviceInfo: async function () {
      const data = await lib.fetchDeviceInfo();
      this.metadata = {
        albumArtist: data.albumArtist,
        albumTitle: data.albumTitle,
        albumUrl: data.albumUrl,
        songTitle: data.songTitle,
        songFormat: data.songFormat,
        songDepth: data.songDepth,
        songQuality: data.songQuality,
        songRate: data.songRate,
        songBitrate: data.songBitrate,
        artist: data.artist,
        album: data.album,
        biography: data.biography,
        streamSource: data.streamSource,
      };
    },
    fetchArtistBio: async function () {
      this.toggles.bio = !this.toggles.bio;
      this.artistBio = await lib.fetchBiography();
    },
    fetchPlayerStatus: async function () {
      this.player = await lib.fetchPlayerStatus("status");
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
  },
  destroy() {
    this.cancelAutoUpdate();
  },
};
</script>

<style>
/* .songSpecsContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
    .streamServiceLogo {
      align-self: flex-start;
      border: 1px red solid;
    }
    .streamQualityLogo {
      align-self: flex-start;
      border: 1px red solid;
    }
    .songSpecs {
      align-self: flex-end;
      border: 1px red solid;
    } */
/* @media (min-width: 1024px) {
  .logs {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
} */
</style>
