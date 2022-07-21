<template>
  <v-card color="#212121" class="overflow-y-auto" max-height="170">
    <v-card-text>
      <p class="text--primary">
        {{ bioText }}
      </p>
    </v-card-text>
    <v-card-text>
      <p
        class="d-flex justify-space-around align-center flex-column flex-sm-row"
      >
        <v-btn
          height="25"
          variant="outlined"
          color="#78909C"
          :href="`http://duckduckgo.com/?q=%5Csite:last.fm ${this.urlDecode(
            artist
          )}/+wiki`"
          target="_blink"
        >
          last.fm
        </v-btn>
        <v-btn
          height="25"
          variant="outlined"
          color="#78909C"
          :href="`http://duckduckgo.com/?q=%5Csite:wikiwand.com ${this.urlDecode(
            artist
          )}`"
          target="_blink"
        >
          Wikiwand
        </v-btn>
        <v-btn
          height="25"
          variant="outlined"
          color="#78909C"
          :href="`http://duckduckgo.com/?q=%5Csite:allmusic.com ${this.urlDecode(
            artist
          )}`"
          target="_blink"
        >
          AllMusic
        </v-btn>
      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { MetadataLib } from "../actions/lib";
const lib = new MetadataLib();

export default {
  name: "Biography",
  props: ["bioText", "artist"],
  data: () => ({}),
  create() {},
  mounted: function () {},
  watch: {},
  methods: {
    urlDecode(str: string): string {
      return encodeURIComponent(str);
    },
  },
};
</script>
