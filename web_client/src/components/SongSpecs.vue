<script setup lang="ts">
  import amazonLogo from '@/assets/amazon-music-logo.png'
  import qobuzLogo from '@/assets/qobuz-logo.png'
  import hiresLogo from '@/assets/hires.png'
  import hdLogo from '@/assets/hd-logo.jpg'
  import uhdLogo from '@/assets/uhd-logo.jpg'
  import cdLogo from '@/assets/cd.jpg'
</script>

<template>
  <v-card color="#242838">
    <v-card-text class="songSpecsContainer">
      <v-row dense>
        <v-col cols="2">
          <v-img
            :src="`${logoImgUrl}`"
            height="20"
            v-if="logoImgUrl"
            class="streamServiceLogo"
          ></v-img>
        </v-col>
        <v-col cols="8">
          <p class="text--primary songSpecs">
            {{ songDepth }} bits / {{ songRate }} kHz
          </p>
        </v-col>
        <v-col cols="2">
          <v-img
            :src="`${qualityImgUrl}`"
            height="20"
            v-if="qualityImgUrl"
            class="streamQualityLogo"
          ></v-img>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  export default {
    name: 'SongSpecs',
    props: ['song', 'streamSource', 'songDepth', 'songRate', 'songBitrate', 'songQuality'],
    data: () => ({
      logoImgUrl: '',
      qualityImgUrl: ''
    }),
    create () {},
    mounted: function () {},
    watch: {
      song(val) {
        if (val) {
          this.updateLogoImg()
          this.updateQualityImg()
        }
      }
    },
    methods: {
      updateQualityImg() {
        if (this.streamSource) {
          switch (this.streamSource) {
            case 'qobuz':
              this.qualityImgUrl = (this.songDepth > 16 && this.songRate > 45) ? hiresLogo : cdLogo
            break
            case 'amazon':
              this.qualityImgUrl = this.songQuality === 'UHD' ? uhdLogo : hdLogo
            break
          }
        }
      },
      updateLogoImg() {
        if (this.streamSource) {
          switch (this.streamSource) {
            case 'amazon':
              this.logoImgUrl = amazonLogo
            break
            case 'qobuz':
              this.logoImgUrl = qobuzLogo
            break
          }
        }
      },
    }
  }
</script>
<style>
  .songSpecsContainer {
    border: 1px #546E7A solid;
  }
    /* .streamServiceLogo {
      border: 1px red solid;
    }
    .streamQualityLogo {
      border: 1px red solid;
    } */
    /* .songSpecs {
      border: 1px red solid;
    } */
</style>