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
        mounted: async () => {
                // console.log("App mounted!");

                // this.reader.addEventListener("load", () => {
                //     this.importedExpectationArray = JSON.parse(this.reader.result?.toString() || "")?.routes;
                // }, false);

                // this.userip = await fetchUserIpAddress();
        },
        computed: {},
        methods: {
            // startProxy: async function () {
            //     this.assignedPort = await sendProxyRequest();
            // },
            // stopProxy: async function () {
            //     await sendProxyStop(this.assignedPort);
            //     this.assignedPort = 0;
            // },
            // loadJson: async function (event: any) {
            //     const fileList = event.target.files;
            //     console.log(fileList);
            //     this.reader.readAsText(fileList[0]);
            // },
            // clearJson: async function (event: any) {
            //     this.importedExpectationArray = [];
            // }
        }
    }
</script>