<template>
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
</template>

<script lang="ts">
  import { MetadataLib } from "../actions/lib"
  const lib = new MetadataLib()
  
  export default {
    name: 'Biography',
    props: ['song'],
    data: () => ({
      artistBio: "",
      toggles: {
        bio: false,
      }, 
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
      fetchArtistBio: async function () {
        this.toggles.bio = !this.toggles.bio;
        this.artistBio = await lib.fetchBiography();
      },
      extlinks: (link: string) => {
        const links = {
          lastfm: () => `https://www.last.fm/music/${lib.urlDecode(this.metadata.artist)}/+wiki`
        }
      },
    }
  }
</script>