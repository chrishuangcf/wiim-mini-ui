<script setup lang="ts">
    // import { RouterLink, RouterView } from 'vue-router'
    import DashBoardView from './views/DashboardView.vue'
    import LogsView from './views/LogsView.vue'
    import GlobalHeadersView from './views/GlobalHeadersView.vue'
    import { fetchUserIpAddress, sendProxyRequest, sendProxyStop } from './actions/appActions'
</script>

<template>

    <v-app>
        <v-system-bar color="pink-darken-2">
            <span class="ml-2">system status : </span>
            <v-icon icon="mdi-web" class="ml-2"></v-icon>
            <span class="ml-2">IP : {{userip}}</span>
        </v-system-bar>
        <v-layout style="z-index: 0">
            <v-app-bar>
                <v-card style="margin-top: 1em">
                    <v-tabs v-model="tab"
                            background-color="pink-lighten-1">
                        <v-tab value="dashboardView">Dashboard</v-tab>
                        <v-tab value="globalHeadersView">Headers</v-tab>
                        <v-tab value="logsView">Logs</v-tab>
                    </v-tabs>
                </v-card>
            </v-app-bar>
            <v-navigation-drawer permanent
                                 location="left">
                <v-list density="compact" nav>
                    <v-list-item prepend-icon="mdi-checkbox-marked-circle" title="Start Proxy" value="Start Proxy" @click="startProxy()"></v-list-item>

                    <v-chip class="ma-1 py-4" prepend-icon="mdi-web"
                            color="grey"
                            label
                            text-color="white">Assigned Port : {{assignedPort}} </v-chip>
                    <v-list-item prepend-icon="mdi-cancel" title="Stop Proxy" value="Stop Proxy" @click="stopProxy()"></v-list-item>
                    <v-divider></v-divider>
                    <v-file-input class="pl-2" density="compact" prepend-icon="mdi-upload" show-size counter hide-details="auto" label="Load Mocks" @change="loadJson($event)" @click:clear="clearJson($event)"></v-file-input>
                    <v-list-item prepend-icon="mdi-vote" title="Open Test Client" value="Open Test Client"></v-list-item>
                    <v-list-item prepend-icon="mdi-trash-can" title="Reset All" value="Reset All"></v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-main>
                <v-window v-model="tab">
                    <v-window-item value="dashboardView">
                        <!-- NOTE: must use v-model to get child $emit changes -->
                        <DashBoardView v-bind:port="assignedPort" v-model:mocks="importedExpectationArray"/> 
                    </v-window-item>
                    <v-window-item value="globalHeadersView">
                        <GlobalHeadersView v-bind:port="assignedPort" />
                    </v-window-item>
                    <v-window-item value="logsView">
                        <LogsView />
                    </v-window-item>
                </v-window>
            </v-main>
        </v-layout>

    </v-app>
</template>

<script lang="ts">

    export default {
        name: 'App',
        data: function () {
            return {
                tab: null,
                importedExpectationArray: [],
                userip: "0.0.0.0",
                assignedPort: 0,
                reader: new FileReader()
            }
        },
        mounted: async function () {
            console.log("App mounted!");

            this.reader.addEventListener("load", () => {
                this.importedExpectationArray = JSON.parse(this.reader.result?.toString() || "")?.routes;
            }, false);

            this.userip = await fetchUserIpAddress();
        },
        methods: {
            startProxy: async function () {
                this.assignedPort = await sendProxyRequest();
            },
            stopProxy: async function () {
                await sendProxyStop(this.assignedPort);
                this.assignedPort = 0;
            },
            loadJson: async function (event: any) {
                const fileList = event.target.files;
                console.log(fileList);
                this.reader.readAsText(fileList[0]);
            },
            clearJson: async function (event: any) {
                this.importedExpectationArray = [];
            }
        }
    }
</script>