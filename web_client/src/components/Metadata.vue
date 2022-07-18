<template>
  <v-card class="floating-metadata" v-if="metadata">
    {{ metadata.artist }}
  </v-card>
</template>

<script lang="ts">
import { MetadataLib } from "../actions/lib";
const lib = new MetadataLib();

export default {
  name: "Metadata",
  props: ["metadata"],
  data: () => ({}),
  created() {},
  mounted: () => {},
  watch: {},
  methods: {},
  destroy() {},
};
</script>
<style>
.floating-metadata {
  float: left;
}
</style>
