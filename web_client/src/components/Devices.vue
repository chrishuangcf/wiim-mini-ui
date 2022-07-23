<template>
  <div>
    <v-btn-toggle class="py-2" color="#607D8B" dark size="xs">
      <v-btn
        v-for="device in deviceList"
        :key="device"
        color="white"
        variant="outlined"
        rounded="sm"
        v-on:click="handleSelectPlayer(`${device.location}`)"
      >
        {{ device.friendlyName }}
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts">
export default {
  name: "Devices",
  props: ["deviceList"],
  data: () => ({}),
  mounted: function () {},
  watch: {},
  methods: {
    handleSelectPlayer(location) {
      this.$emit("location", location);
    },
  },
};
</script>
