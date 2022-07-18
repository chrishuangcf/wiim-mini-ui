<script setup lang="ts">
  import ToolBar from '../components/ToolBar.vue'
</script>

<template>
    <v-img
      :src="`${imgUrl}`"
      aspect-ratio="1"
      cover
      class="bg-grey-lighten-2 align-end text-white"
    >
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey-lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>
</template>

<script lang="ts">
  export default {
    name: 'AlbumArt',
    props: ['imgUrl'],
    data: () => ({}),
    mounted: function () {
    },
    watch: {
    },
    methods: {
    }
  }
</script>
