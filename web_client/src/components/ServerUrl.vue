<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="updatedServerUrl"
            label="wiim_server location : ex: 192.168.0.1"
            class="text-white"
            color="#EA80FC"
          ></v-text-field>
          <v-btn color="#EA80FC"
class="mr-4"
@click="handleUpdateServerUrl"
>Save</v-btn>
        </v-col>
        <v-col cols="2"> </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
  export default {
    name: "ServerUrl",
    data: () => ({
      updatedServerUrl: "",
    }),
    mounted: function () {},
    watch: {},
    methods: {
      handleUpdateServerUrl() {
        this.$emit("updatedServerUrl", this.updatedServerUrl);
      },
    },
  };
</script>
