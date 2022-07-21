<script setup lang="ts">
import ToolBar from "@/components/ToolBar.vue";
import AlbumArt from "@/components/AlbumArt.vue";
import SongSpecs from "@/components/SongSpecs.vue";
import Biography from "@/components/Biography.vue";
import type { deviceType } from "./actions/types";
</script>

<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <v-card color="#263238" theme="dark">
          <div class="d-flex flex-row justify-space-around">
            <v-col cols="5">
              <AlbumArt :imgUrl="metadata.albumUrl" />
            </v-col>
            <v-col cols="7">
              <v-card color="#212121" height="100%">
                <v-card-title class="text-h4 text--primary text-wrap">
                  <div class="text-h5 text--primary">
                    {{ metadata.songTitle }}
                  </div>
                  <v-divider insert thickness="1" />
                  <div class="text-h6 text--primary">
                    {{ metadata.albumTitle }}
                  </div>
                </v-card-title>
                <v-card-subtitle>
                  <p>
                    <SongSpecs
                      :song="metadata.songTitle"
                      :streamSource="metadata.streamSource"
                      :songDepth="metadata.songDepth"
                      :songRate="metadata.songRate"
                      :songBitrate="metadata.songBitrate"
                      :songQuality="metadata.songQuality"
                    /></p
                ></v-card-subtitle>

                <v-card-text>
                  <v-btn
                    rounded="lg"
                    color="#EA80FC"
                    v-on:click="toggleBio"
                    style="text-overflow: ellipsis"
                  >
                    {{ displayArtistShortName }}
                  </v-btn>
                </v-card-text>
                <ToolBar
                  :playerStatus="playerStatus"
                  :playerName="playerName"
                  @player="postActions"
                  color="#424242"
                  style="position: absolute; bottom: 0px; width: 100%"
                />
              </v-card>
            </v-col>
          </div>
        </v-card>

        <v-card color="#37474F" v-if="toggles.bio">
          <Biography :bioText="artistBio" :artist="metadata.artist" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
        streamSource: "",
      },
      playerStatus: "PAUSED_PLAYBACK",
      playerName: "",
      artistBio: "",
      currentArtist: "",
      displayArtistShortName: "",
      toggles: {
        bio: false,
      },
      timer: 0,
    };
  },
  components: { ToolBar, AlbumArt, SongSpecs, Biography },
  created() {
    this.fetchMetadata();
    this.fetchPlayerStatus();
    this.timer = setInterval(this.fetchRefreshData, 1000);
  },
  mounted: () => {},
  watch: {
    currentArtist: {
      immediate: true,
      handler(newValue, oldValue) {
        this.fetchArtistBio();
        this.fetchDeviceInfo();
      },
    },
  },
  methods: {
    fetchDeviceInfo: async function () {
      const data: deviceType = await lib.fetchDeviceInfo();
      this.playerName = `${data.friendlyName} (${data.deviceType})`;
    },
    fetchRefreshData: async function () {
      await this.fetchMetadata();
      await this.fetchPlayerStatus();
    },
    fetchMetadata: async function () {
      const data = await lib.fetchMetadata();
      this.metadata = {
        albumArtist: data.albumArtist || "",
        albumTitle: data.albumTitle || "",
        albumUrl: data.albumUrl || "",
        songTitle: data.songTitle || "",
        songFormat: data.songFormat || "",
        songDepth: data.songDepth || 0,
        songQuality: data.songQuality || "",
        songRate: data.songRate || 0,
        songBitrate: data.songBitrate || 0,
        artist: data.artist || "",
        album: data.album || "",
        streamSource: data.streamSource || "",
      };
      this.currentArtist = this.metadata.artist;
      this.currentSong = this.metadata.songTitle;
      this.displayArtistShortName = this.displayShortName(this.metadata.artist);
    },
    fetchArtistBio: async function () {
      this.artistBio = await lib.fetchBiography();
    },
    fetchPlayerStatus: async function () {
      this.playerStatus = await lib.fetchPlayerStatus("status").status;
    },
    displayShortName: function (artist: string) {
      if (artist.length > 50) {
        this.displayArtistShortName = artist.substring(0, 50);
        return this.displayArtistShortName;
      }
    },
    toggleBio: async function () {
      this.toggles.bio = !this.toggles.bio;
    },
    postActions: (action: string) => {
      lib.postPlayerActions(action);
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
