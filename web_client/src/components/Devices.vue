<template>
  <div v-if="deviceList" class="d-flex mb-2">
    <v-btn-toggle
      class="py-2"
      color="#212121"
      dark
      size="xs"
      style="margin-top: 0.25em"
    >
      <v-btn
        v-for="device in deviceList"
        :key="device"
        color="#EA80FC"
        variant="flat"
        rounded="sm"
        v-on:click="handleSelectPlayer(`${device.location}`)"
        style="margin-left: 0.5em"
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
