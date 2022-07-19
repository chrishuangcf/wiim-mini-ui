<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import HomeView from './views/HomeView.vue'
</script>

<template>
    <v-card>
        <v-responsive :aspect-ratio="5/5">
        <v-card-text>
            <HomeView/>
        </v-card-text>
        </v-responsive>
    </v-card>
</template>

<script lang="ts">

    export default {
        name: 'App',
        data: () => ({}),
        components: { HomeView },
        beforeUnmount: () => {},
        mounted: async () => {},
        computed: {},
        methods: {}
    }
</script>