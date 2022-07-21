<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import HomeView from "./views/HomeView.vue";
</script>

<template>
  <HomeView />
</template>

<script lang="ts">
export default {
  name: "App",
  data: () => ({}),
  components: { HomeView },
  beforeUnmount: () => {},
  mounted: async () => {},
  computed: {},
  methods: {},
};
</script>
