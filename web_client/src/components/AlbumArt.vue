<template>
  <v-card>
    <v-avatar size="100%" rounded="0">
      <v-img
        :src="`${props.imgUrl}`"
        aspect-ratio="1/1"
        cover
        class="bg-grey-lighten-2 align-end text-white"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular
              indeterminate
              color="grey-lighten-5"
            ></v-progress-circular>
          </v-row>
        </template>
        <!-- Backend Status Indicator Dot -->
        <div class="status-indicator-container">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props: tooltipProps }">
              <div
                v-bind="tooltipProps"
                class="status-dot"
                :class="statusDotClass"
                @click="showHealthDialog = true"
              ></div>
            </template>
            <span>Backend Services - {{ backendStatus }}</span>
          </v-tooltip>
        </div>
        <v-row dense>
          <v-col cols="12" align="center">
            <div
              style="
                display: flex;
                justify-content: space-between;
                width: 100%;
                background-color: rgba(37, 27, 43, 0.5);
                margin-bottom: -25px;
              "
            >
              <span
                class="text-caption"
                style="color: pink; width: 10%; margin-left: auto"
              >
                {{ props.realTime }}
              </span>
              <v-spacer style="color: pink">
                <span v-if="props.loopMode === `0`">
                  <v-icon icon="mdi-repeat" size="xs" />
                  <v-icon icon="mdi-shuffle-disabled" size="xs" />
                </span>

                <span v-if="props.loopMode === `1`">
                  <v-icon icon="mdi-repeat-once" size="xs" />
                  <v-icon icon="mdi-shuffle-disabled" size="xs" />
                </span>

                <span v-if="props.loopMode === `2`">
                  <v-icon icon="mdi-repeat" size="xs" />
                  <v-icon icon="mdi-shuffle" size="xs" />
                </span>

                <span v-if="props.loopMode === `3`">
                  <v-icon icon="mdi-repeat-off" size="xs" />
                  <v-icon icon="mdi-shuffle" size="xs" />
                </span>

                <span v-if="props.loopMode === `4`">
                  <v-icon icon="mdi-repeat-off" size="xs" />
                  <v-icon icon="mdi-shuffle-disabled" size="xs" />
                </span>

                <span v-if="props.loopMode === `5`">
                  <v-icon icon="mdi-repeat-once" size="xs" />
                  <v-icon icon="mdi-shuffle" size="xs" />
                </span>
              </v-spacer>
              <v-spacer style="color: pink">
                <v-icon icon="mdi-volume-medium" size="xs" v-if="props.volume > 0" />
                <span v-if="props.volume > 0" class="text-caption">
                  {{ props.volume }}
                </span>
              </v-spacer>
              <span
                class="text-caption"
                style="color: pink; width: 10%; margin-left: auto"
                v-if="props.songDuration !== '0'"
              >
                {{ props.songDuration }}
              </span>
              <span
                class="text-caption"
                style="color: pink; width: 10%; margin-left: auto"
                v-if="props.songDuration === '0'"
              >
                <v-icon icon="mdi-infinity" size="xs" />
              </span>
            </div>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="12">
            <v-progress-linear
              :model-value="props.currentPos"
              color="purple-lighten-2"
              buffer-value="0"
              stream
              height="6"
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-img>
    </v-avatar>
  </v-card>

  <!-- Backend Health Status Dialog -->
  <v-dialog v-model="showHealthDialog" max-width="500">
    <v-card>
      <v-card-title class="d-flex align-center">
        <div
          class="status-dot-large mr-2"
          :class="statusDotClass"
        ></div>
        Backend Service Health
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-title>Backend Status</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="statusColor" size="small" class="mt-1">
                {{ healthData.status || 'Unknown' }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="healthData.uptime !== undefined">
            <v-list-item-title>Uptime</v-list-item-title>
            <v-list-item-subtitle>{{ formatUptime(healthData.uptime) }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="healthData.services?.upnp">
            <v-list-item-title>UPnP Discovery</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                :color="healthData.services.upnp?.status === 'ok' ? 'success' : 'warning'"
                size="small"
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
                size="small"
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
        <v-btn color="grey" variant="text" @click="showHealthDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

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

const props = defineProps({
  imgUrl: { type: String },
  songDuration: { type: String },
  realTime: { type: String },
  currentPos: { type: Number },
  volume: { type: Number },
  loopMode: { type: Number },
  serverUrl: { type: String, default: '' }
});

const showHealthDialog = ref(false);
const healthData = ref<HealthData>({ status: 'checking' });
const lastChecked = ref<Date | null>(null);
const error = ref<string | null>(null);
const checkInterval = ref<number | undefined>(undefined);

const backendStatus = computed(() => {
  if (error.value) return 'Offline';
  if (healthData.value.status === 'ok') return 'Online';
  return 'Checking...';
});

const statusColor = computed(() => {
  if (error.value) return 'error';
  if (healthData.value.status === 'ok') return 'success';
  return 'warning';
});

const statusDotClass = computed(() => {
  if (error.value) return 'status-dot-offline';
  if (healthData.value.status === 'ok') return 'status-dot-online';
  return 'status-dot-checking';
});

const checkHealth = async () => {
  try {
    const url = props.serverUrl || window.location.origin;
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    healthData.value = await response.json();
    lastChecked.value = new Date();
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to connect to backend';
    healthData.value = { status: 'error' };
  }
};

const formatUptime = (seconds: number): string => {
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
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString();
};

onMounted(() => {
  // Check health immediately on mount
  checkHealth();
  
  // Check health every 10 seconds
  checkInterval.value = setInterval(() => {
    checkHealth();
  }, 10000) as unknown as number;
});

onBeforeUnmount(() => {
  if (checkInterval.value) {
    clearInterval(checkInterval.value);
  }
});
</script>

<style scoped>
.status-indicator-container {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.status-dot:hover {
  transform: scale(1.3);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
}

.status-dot-online {
  background-color: #4caf50;
  animation: pulse-green 2s infinite;
}

.status-dot-offline {
  background-color: #f44336;
  animation: pulse-red 2s infinite;
}

.status-dot-checking {
  background-color: #ff9800;
  animation: pulse-orange 2s infinite;
}

.status-dot-large {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  50% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 6px rgba(76, 175, 80, 0);
  }
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  50% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 6px rgba(244, 67, 54, 0);
  }
}

@keyframes pulse-orange {
  0%, 100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  50% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 6px rgba(255, 152, 0, 0);
  }
}
</style>