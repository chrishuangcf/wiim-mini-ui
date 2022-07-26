<template>
  <v-card>
    <v-avatar size="100%"
rounded="0"
>
      <v-img
        :src="`${imgUrl}`"
        aspect-ratio="1/1"
        cover
        class="bg-grey-lighten-2 align-end text-white"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0"
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
    </v-avatar>
  </v-card>
</template>

<script lang="ts">
  export default {
    name: "AlbumArt",
    props: ["imgUrl"],
    data: () => ({}),
    mounted: function () {},
    watch: {},
    methods: {},
  };
</script>
