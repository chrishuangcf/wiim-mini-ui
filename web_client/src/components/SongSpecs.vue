<script setup lang="ts">
import amazonLogo from "@/assets/amazon-music-logo.png";
import qobuzLogo from "@/assets/qobuz-logo.png";
import spotifyLogo from "@/assets/spotify-logo.png";
import hiresLogo from "@/assets/hires.png";
import hdLogo from "@/assets/hd-logo.jpg";
import uhdLogo from "@/assets/uhd-logo.jpg";
import cdLogo from "@/assets/cd.jpg";
import mp3Logo from "@/assets/mp3.png";
</script>

<template>
  <v-row>
    <v-col cols="2">
      <v-img
        :src="`${logoImgUrl}`"
        height="20"
        v-if="logoImgUrl"
        class="streamServiceLogo"
      ></v-img>
    </v-col>
    <v-col cols="2">
      <v-img
        :src="`${qualityImgUrl}`"
        height="20"
        v-if="qualityImgUrl"
        class="streamQualityLogo"
      ></v-img>
    </v-col>
    <v-col cols="8">
      <p class="text--primary songSpecs">
        {{ songDepth }} bits / {{ songRate }} kHz
      </p>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "SongSpecs",
  props: [
    "song",
    "streamSource",
    "songDepth",
    "songRate",
    "songBitrate",
    "songQuality",
  ],
  data: () => ({
    logoImgUrl: "",
    qualityImgUrl: "",
  }),
  create() {},
  mounted: function () {},
  watch: {
    song: {
      immediate: true,
      handler(newValue, oldValue) {
        this.updateSongSpecs();
      },
    },
    songDepth: {
      immediate: true,
      handler(newValue, oldValue) {
        this.updateAudioQualityImg();
      },
    },
  },
  methods: {
    updateSongSpecs() {
      if (this.streamSource) {
        switch (this.streamSource) {
          case "qobuz":
            this.logoImgUrl = qobuzLogo;
            break;
          case "amazon":
            this.logoImgUrl = amazonLogo;
            break;
          case "spotify":
            this.logoImgUrl = spotifyLogo;
            break;
        }
      }
    },
    updateAudioQualityImg() {
      if (this.streamSource) {
        switch (this.streamSource) {
          case "qobuz":
            if (this.songDepth === 0) {
              this.qualityImgUrl = "";
            } else {
              this.qualityImgUrl = this.songDepth > 16 ? hiresLogo : cdLogo;
            }
            break;
          case "amazon":
            if (this.songQuality === "") {
              this.qualityImgUrl = "";
            } else {
              this.qualityImgUrl =
                this.songQuality === "UHD" ? uhdLogo : hdLogo;
            }
            break;
          case "spotify":
            this.qualityImgUrl = mp3Logo;
            break;
        }
      }
    },
  },
};
</script>
