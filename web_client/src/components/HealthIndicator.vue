<template>
  <v-chip
    :color="statusColor"
    :prepend-icon="statusIcon"
    size="small"
    variant="flat"
    class="health-indicator"
    @click="showDetails = !showDetails"
  >
    <span class="text-caption">{{ statusText }}</span>
  </v-chip>

  <v-dialog v-model="showDetails" max-width="500">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :color="statusColor" class="mr-2">{{ statusIcon }}</v-icon>
        Service Health
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-title>Backend Status</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="statusColor" size="x-small" class="mt-1">
                {{ healthData.status }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="healthData.uptime !== undefined">
            <v-list-item-title>Uptime</v-list-item-title>
            <v-list-item-subtitle>{{ formatUptime(healthData.uptime) }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="healthData.services">
            <v-list-item-title>UPnP Discovery</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                :color="healthData.services.upnp?.status === 'ok' ? 'success' : 'warning'"
                size="x-small"
                class="mt-1"
              >
                {{ healthData.services.upnp?.deviceCount || 0 }} devices found
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="healthData.services?.selectedDevice">
            <v-list-item-title>Selected Device</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                :color="healthData.services.selectedDevice.status === 'connected' ? 'success' : 'grey'"
                size="x-small"
                class="mt-1"
              >
                {{ healthData.services.selectedDevice.status === 'connected' ? 'Connected' : 'Not Selected' }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="lastChecked">
            <v-list-item-title>Last Checked</v-list-item-title>
            <v-list-item-subtitle>{{ formatTimestamp(lastChecked) }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="error">
            <v-list-item-title class="text-error">Error</v-list-item-title>
            <v-list-item-subtitle class="text-error">{{ error }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="checkHealth">
          Refresh
        </v-btn>
        <v-btn color="grey" variant="text" @click="showDetails = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface HealthData {
  status: string;
  uptime?: number;
  timestamp?: string;
  services?: {
    upnp?: {
      status: string;
      deviceCount: number;
    };
    selectedDevice?: {
      status: string;
      device: any;
    };
  };
}

export default defineComponent({
  name: 'HealthIndicator',
  props: {
    serverUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      healthData: {} as HealthData,
      lastChecked: null as Date | null,
      error: null as string | null,
      showDetails: false,
      checkInterval: undefined as number | undefined,
    };
  },
  computed: {
    statusColor(): string {
      if (this.error) return 'error';
      if (this.healthData.status === 'ok') return 'success';
      return 'warning';
    },
    statusIcon(): string {
      if (this.error) return 'mdi-alert-circle';
      if (this.healthData.status === 'ok') return 'mdi-check-circle';
      return 'mdi-alert';
    },
    statusText(): string {
      if (this.error) return 'Backend Offline';
      if (this.healthData.status === 'ok') return 'Backend Online';
      return 'Checking...';
    },
  },
  methods: {
    async checkHealth() {
      try {
        const url = this.serverUrl || window.location.origin;
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.healthData = await response.json();
        this.lastChecked = new Date();
        this.error = null;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to connect to backend';
        this.healthData = { status: 'error' };
      }
    },
    formatUptime(seconds: number): string {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    },
    formatTimestamp(date: Date): string {
      return date.toLocaleTimeString();
    },
  },
  mounted() {
    // Check health immediately on mount
    this.checkHealth();
    
    // Check health every 10 seconds
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, 10000) as unknown as number;
  },
  beforeUnmount() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
});
</script>

<style scoped>
.health-indicator {
  cursor: pointer;
  transition: all 0.3s ease;
}

.health-indicator:hover {
  opacity: 0.8;
}
</style>
