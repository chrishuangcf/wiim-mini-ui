<script setup lang="ts">
  import HomeView from "./views/HomeView.vue";
</script>

<template>
  <home-view />
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
