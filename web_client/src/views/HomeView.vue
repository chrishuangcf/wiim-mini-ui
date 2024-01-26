<script setup lang="ts">
import * as Types from "../types/types";
import ToolBar from "@/components/ToolBar.vue";
import AlbumArt from "@/components/AlbumArt.vue";
import SongSpecs from "@/components/SongSpecs.vue";
import Biography from "@/components/Biography.vue";
import ServerUrl from "@/components/ServerUrl.vue";
import DeviceList from "@/components/DeviceList.vue";
import CoverArt from "@/assets/cover.jpg";
</script>

<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <v-card color="#263238" theme="dark">
          <div class="d-flex flex-row justify-space-around">
            <v-col cols="5">
              <AlbumArt
                :imgUrl="metadata.albumUrl"
                :realTime="metadata.realTime"
                :songDuration="metadata.songDuration"
                :currentPos="currentPos"
                :volume="metadata.volume"
                :loopMode="metadata.loopMode"
              />
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
                    v-if="metadata.artist"
                  >
                    {{ displayArtistShortName }}
                  </v-btn>
                </v-card-text>
                <div style="width: 100%">
                  <ToolBar
                    :playerStatus="playerStatus"
                    :seletedRenderer="seletedRenderer"
                    :realTime="metadata.realTime"
                    :songDuration="metadata.songDuration"
                    :currentPos="currentPos"
                    @player="postActions"
                    @showServerUrl="toggleServerUrl"
                    @showDevices="toggleDeviceList"
                    color="#424242"
                  />
                </div>
              </v-card>
            </v-col>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="toggles.devices">
      <v-col cols="12">
        <v-card color="#263238" theme="dark">
          <DeviceList :deviceList="deviceList" @location="postInit" />
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="toggles.serverUrl">
      <v-col cols="12">
        <v-card color="#263238">
          <ServerUrl color="white" @updatedServerUrl="postServeUrl" />
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" v-if="toggles.bio">
        <v-card color="#616161">
          <Biography :bioText="artistBio" :artist="metadata.artist" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Utilities } from "../actions/lib";
import { SliderPosition } from "../actions/ui-lib";

const lib = new Utilities();

export default {
  name: "HomeView",
  data: () => {
    return {
      metadata: {
        albumArtist: "Album Artist",
        albumTitle: "Album Title",
        albumUrl: CoverArt,
        songTitle: "Song Title",
        songFormat: "",
        songDepth: 0,
        songQuality: "",
        songRate: 0,
        songBitrate: 0,
        artist: "",
        album: "Album Title",
        streamSource: "",
        songDuration: "",
        realTime: "",
        volume: 0,
        loopMode: 0,
      },
      playerStatus: "PAUSED_PLAYBACK",
      artistBio: "",
      currentArtist: "",
      displayArtistShortName: "",
      currentPos: 0,
      toggles: {
        bio: false,
        devices: false,
        serverUrl: false,
      },
      seletedRenderer: undefined,
      deviceList: undefined,
      timer: 0,
    };
  },
  components: {
    ToolBar,
    AlbumArt,
    SongSpecs,
    Biography,
    DeviceList,
    ServerUrl,
  },
  created() {
    this.fetchDeviceList();
    this.timer = setInterval(this.fetchRefreshData, 1000);
  },
  mounted: () => {},
  watch: {
    currentArtist: {
      immediate: true,
      handler(newValue, oldValue) {
        this.fetchArtistBio();
      },
    },
  },
  methods: {
    fetchDeviceList: async function () {
      this.deviceList = await lib.fetchDeviceList();
    },
    fetchRefreshData: async function () {
      await this.fetchMetadata();
      await this.fetchPlayerStatus();
    },
    fetchMetadata: async function () {
      const data: Types.metadataType = await lib.fetchMetadata();
      const { length, current, percent } = await SliderPosition(
        data.songDuration,
        data.realTime
      );
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
        songDuration: length,
        realTime: current,
        volume: data.volume || 0,
        loopMode: data.loopMode || 0,
      };
      this.currentArtist = this.metadata.artist;
      this.currentSong = this.metadata.songTitle;
      this.displayArtistShortName = this.displayShortName(this.metadata.artist);
      this.currentPos = percent;
    },
    fetchArtistBio: async function () {
      this.artistBio = await lib.fetchBiography();
    },
    fetchPlayerStatus: async function () {
      this.playerStatus = await lib.postPlayerActions("status");
    },
    displayShortName: function (artist: string) {
      if (artist.length > 50) {
        return artist.substring(0, 50);
      } else {
        return artist;
      }
    },
    toggleBio: async function () {
      this.toggles.bio = !this.toggles.bio;
    },
    toggleDeviceList: function (showDevices: boolean) {
      this.fetchDeviceList();
      this.toggles.devices = showDevices;
    },
    toggleServerUrl: function (showServerUrl: boolean) {
      this.toggles.serverUrl = showServerUrl;
    },
    postInit: function (location: string) {
      this.seletedRenderer = location;
      lib.postInit(location);
    },
    postActions: function (action: string) {
      lib.postPlayerActions(action);
    },
    postServeUrl: function (updatedServerUrl: string) {
      this.toggleServerUrl(false);
      lib.init(updatedServerUrl);
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
