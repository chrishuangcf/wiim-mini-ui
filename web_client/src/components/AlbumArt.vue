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
        <v-row dense>
          <v-col cols="12" align="center">
            <div
              style="
                display: flex;
                justify-content: space-between;
                width: 100%;
                background-color: rgba(37, 27, 43, 0.5);
                margin-bottom: -5px;
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
              v-model="props.currentPos"
              color="purple-lighten-2"
              buffer-value="0"
              stream
              reactive
              rounded-bar
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-img>
    </v-avatar>
  </v-card>
</template>

<script setup>
  const props = defineProps({
    imgUrl : { type: String },
    songDuration: { type: String },
    realTime: { type: String},
    currentPos: { type: String },
    volume: { type: Number },
    loopMode: { type: String}
  })
</script>