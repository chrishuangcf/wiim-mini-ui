<script setup lang="ts">
import amazonLogo from "@/assets/amazon-music-logo.png";
import qobuzLogo from "@/assets/qobuz-logo.png";
import spotifyLogo from "@/assets/spotify-logo.png";
import hiresLogo from "@/assets/hires.png";
import hdLogo from "@/assets/hd-logo.jpg";
import uhdLogo from "@/assets/uhd-logo.jpg";
import cdLogo from "@/assets/cd.jpg";
import mp3Logo from "@/assets/mp3.png";
import dlnaLogo from "@/assets/dlna.png";
import tuneInRadioLogo from "@/assets/tunein.png";
import iheartRadioLogo from "@/assets/iheart.png";
import deezerLogo from "@/assets/deezer.png";
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
        <span v-if="songDepth > 0">{{ songDepth }} bits / </span>
        {{ songRate }} kHz
        <span v-if="songBitrate > 0">{{ songBitrate }} Mbps</span>
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
      handler() {
        this.updateSongSpecs();
      },
    },
    songDepth: {
      immediate: true,
      handler() {
        this.updateSongSpecs();
        this.updateAudioQualityImg();
      },
    },
    songBitrate: {
      immediate: true,
      handler() {
        this.updateSongSpecs();
        this.updateAudioQualityImg();
      },
    },
    songQuality: {
      immediate: true,
      handler() {
        this.updateSongSpecs();
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
          case "prime":
            this.logoImgUrl = amazonLogo;
            break;
          case "spotify":
            this.logoImgUrl = spotifyLogo;
            break;
          case "upnpserver":
            this.logoImgUrl = dlnaLogo;
            break;
          case "newtunein":
            this.logoImgUrl = tuneInRadioLogo;
            break;
          case "iheartradio":
            this.logoImgUrl = iheartRadioLogo;
            break;
          case "deezer":
            this.logoImgUrl = deezerLogo;
            break;
          default:
            this.logoImgUrl = dlnaLogo;
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
          case "prime":
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
          default:
            this.qualityImgUrl = this.songRate > 44.1 ? hiresLogo : cdLogo;
        }
      }
    },
  },
};
</script>
