<template>
  <div>
    <div v-if="deviceList && deviceList.length" class="d-flex mb-2">
      <v-btn-toggle
        class="py-2"
        color="#212121"
        dark
        size="xs"
        style="margin-top: 0.25em"
      >
        <v-btn
          v-for="device in deviceList"
          :key="device.uuid || device.location"
          color="#EA80FC"
          variant="flat"
          rounded="sm"
          v-on:click="handleSelectPlayer(device.location)"
          style="margin-left: 0.5em"
        >
          {{ device.friendlyName }}
        </v-btn>
      </v-btn-toggle>
      <v-btn
        color="#00BFAE"
        variant="flat"
        rounded="sm"
        style="margin-left: 1em"
        @click="refreshDevices"
      >
        Refresh
      </v-btn>
    </div>
    <div v-else class="d-flex align-center" style="margin-top: 1em">
      <span>No devices found.</span>
      <v-btn
        color="#00BFAE"
        variant="flat"
        rounded="sm"
        style="margin-left: 1em"
        @click="refreshDevices"
      >
        Refresh
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { io, Socket } from "socket.io-client";
export default {
  name: "DeviceList",
  data() {
    return {
      deviceList: [] as any[],
      socket: null as Socket | null,
      socketError: false,
    };
  },
  mounted() {
    try {
      this.socket = io("http://localhost:8080");
      this.socket.on("devices", (devices: any[]) => {
        this.deviceList = devices;
      });
      this.socket.on("connect_error", () => {
        this.socketError = true;
      });
      this.socket.emit("devices");
    } catch (e) {
      this.socketError = true;
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
    handleSelectPlayer(location: string) {
      this.$emit("location", location);
    },
    refreshDevices() {
      if (this.socket) {
        this.socket.emit("devices");
      }
    },
  },
};
</script>
