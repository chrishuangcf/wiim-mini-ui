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
    </div>
    <div v-else class="d-flex align-center justify-center" style="margin-top: 1em; margin-bottom: 1em">
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="no-devices-alert"
      >
        <template v-slot:prepend>
          <v-icon size="large">mdi-speaker-off</v-icon>
        </template>
        <div class="d-flex align-center">
          <span class="text-body-2">
            No devices found. Click the 
            <v-icon size="small" class="mx-1">mdi-speaker</v-icon>
            speaker icon to refresh.
          </span>
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { io, Socket } from "socket.io-client";
export default {
  name: "DeviceList",
  props: {
    // Allow parent to pass a pre-created socket (optional)
    socketInstance: { type: Object, required: false },
  },
  data() {
    return {
      deviceList: [] as any[],
      socket: null as Socket | null,
      socketError: false,
      backendUrl: (import.meta as any).env?.VITE_BACKEND_URL || "",
      triedFallback: false,
    };
  },
  mounted() {
    this.initSocket();
  },
  beforeUnmount() {
    if (this.socket && !this.socketInstance) {
      // Only disconnect if we created it locally
      this.socket.disconnect();
    }
  },
  methods: {
    initSocket() {
      if (this.socketInstance) {
        this.socket = this.socketInstance as Socket;
        this.attachListeners();
        this.socket.emit("devices");
        return;
      }
      try {
        const base = this.backendUrl || window.location.origin;
        this.socket = io(base, { transports: ["websocket", "polling"] });
        this.socket.on("connect_error", () => {
          if (!this.triedFallback && !this.backendUrl) {
            this.triedFallback = true;
            const fallback = `${window.location.protocol}//${window.location.hostname}:8080`;
            this.socket?.disconnect();
            this.socket = io(fallback, { transports: ["websocket", "polling"] });
            this.attachListeners();
            this.socket.emit("devices");
          } else {
            this.socketError = true;
          }
        });
        this.attachListeners();
        this.socket.emit("devices");
      } catch (e) {
        this.socketError = true;
      }
    },
    attachListeners() {
      if (!this.socket) return;
      this.socket.on("devices", (devices: any[]) => {
        this.deviceList = devices;
      });
      // Real-time incremental updates
      this.socket.on("device:discovered", (device: any) => {
        if (!this.deviceList.find((d) => d.uuid === device.uuid || d.location === device.location)) {
          this.deviceList.push(device);
        }
      });
      this.socket.on("device:removed", (uuid: string) => {
        this.deviceList = this.deviceList.filter((d) => d.uuid !== uuid);
      });
    },
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

<style scoped>
.no-devices-alert {
  max-width: 500px;
  margin: 0 auto;
}

.no-devices-alert :deep(.v-alert__prepend) {
  align-self: center;
}
</style>
