
<template>
    <v-container fluid>
        <h2>{{title}} Port: {{port}}</h2>
        <p>{{subhead}} </p>
    </v-container>
    <v-container fluid>
        <v-col><v-btn @click="addMock()">Add Route + </v-btn></v-col>    
        <v-alert class="ma-3" v-model="showAlert" color="info"
                                                                                  title="Proxy not Started"
                                                                                  variant="tonal">
            <div>
                For and endpoint to be registered and a mocked response returned the Proxy Server needs to be started and a port assigned. You can use the menu buttons to your left. Or if your mocks are all ready you can start it now.
            </div>

            <v-divider class="my-4 bg-light-blue-lighten-4"></v-divider>

            <div class="d-flex flex-row align-center justify-space-between">
                <div>
                    Start proxy Box now?
                </div>
                <div>
                    <v-btn class="float-right ml-4" color="info" variant="outlined" @click="startProxy()">
                        Okay
                    </v-btn>
                    <v-btn class="float-right" color="info"
                           variant="outlined" @click="closeAlert()">
                        Cancel
                    </v-btn>

                </div>

            </div>
        </v-alert>
    </v-container>
    <v-layout row>
        <v-col cols="6" md="7">
            <v-item-group selected-class="bg-primary" @update:modelValue="selectionChanged($event)" v-model="selectedIndex">
                <v-col v-for="(mock, i) in mocks"
                       :key="1">
                    <v-item v-slot="{ isSelected, selectedClass, toggle}">
                        <v-card :class="['r-flex align-center', selectedClass, 'pa-2']"
                                dark
                                @click="toggle">
                            <v-row>
                                <v-col>
                                    <div class="text-body-1 flex-grow-1 text-left">
                                        {{mock.registeredExpectation?.id || mock.uuid }}
                                    </div>
                                    <div class="text-h6 flex-grow-1 text-left">
                                        {{mock.endpoint}}
                                    </div>
                                    <div class="text-subhead flex-grow-1 text-left">
                                        {{mock.documentation}}
                                    </div>
                                    <div class="text-h6 flex-grow-1 text-left">
                                        {{mock.method?.toUpperCase()}}
                                        {{mock.responses && mock.responses[0].statusCode}}
                                        <v-switch v-model="mock.enabled" inset hide-details="true" @click.stop="submitMock(i, $event)" class="d-block" density="default" color="green" label="Use Mock"></v-switch>
                                    </div>
                                </v-col>

                                <v-col>
                                    <v-btn density="compact" class="float-right" icon="mdi-close" color="red" @click.stop="removeMock(i)"></v-btn>
                                </v-col>
                            </v-row>
                        </v-card>

                    </v-item>
                </v-col>
            </v-item-group>
        </v-col>

        <v-col cols="5" md="5">
            <SelectedEndpoint v-bind:port="port" v-bind:mock="selectedEndpoint" />
        </v-col>
    </v-layout>
</template>

<script>
    import SelectedEndpoint from '../components/SelectedEndpoint.vue'

    export default {
        name: 'DashBoard',
        props: ['port', 'mocks'],
        emits: ['update:mocks'], // update is a reserved word
        components: {
            "SelectedEndpoint": SelectedEndpoint,
        },
        data: function () {
            const emptyEndpoint = {
                endpoint: "/path",
                documentation: "notes",
                enabled: false,
                uuid: "",
                responses: [{ body: "{}", latency: "0", headers: [], statusCode: 100 }]
            };

            return {
                selectedIndex: 0,
                title: "Welcome to Proxy Box",
                subhead: "Register these endpoints and receive mocked responses.",
                selectedEndpoint: emptyEndpoint,
                emptyEndpoint: emptyEndpoint,
                showAlert :false
            }
        },

        mounted: function () {
            console.log("DashBoard view mounted!!");
            this.title = "Welcome to Proxy Box. Load some mocks. Register your endpoints.";
        },
        watch: {
            mocks(newValue, oldValue) {
                if (newValue.length == 0) {
                    this.selectedEndpoint = this.emptyEndpoint;
                }
            }
        },
        methods: {
            addMock: async function () {
                var mocktemp = this.mocks; // can't update prop directly

                // the empty object become the last selected object for some reason, using this manual instatiation object
                mocktemp.unshift({
                    endpoint: "/path",
                    method: "GET",
                    documentation: "notes",
                    enabled: false,
                    uuid: "",
                    responses: [{ body: "{}", latency: "0", headers: [], statusCode: 100 }]
                });

                this.$emit('update:mocks', mocktemp); // update is the actual event name the parent will listen for
                this.selectedIndex = 0;
                this.selectedEndpoint = this.mocks[0];
            },
            removeMock: async function (mockIndex) {
                console.log("remove mock at " + mockIndex);
                var mocksTemp = this.mocks.filter((value, index, array) => index != mockIndex);
                if (this.selectedEndpoint == this.mocks[mockIndex]) {
                    this.selectedEndpoint = this.emptyEndpoint;
                }
                this.$emit('update:mocks', mocksTemp); // update is the actual event name the parent will listen for
            },
            submitMock: async function (index, e) {
                console.log("submitMock!!" + index);
                if (this.port == 0) {
                    this.showAlert = true;
                } else {
                //  sendHeadersToProxy(this.headerItems, this.port);
                }
            },
            selectionChanged: async function (event) {
                console.log("changed!!" + event);
                if (event != undefined) {
                    this.selectedEndpoint = this.mocks[event];
                }
            },
            closeAlert: function () {
                this.showAlert = false;
                this.mocks.forEach((m) => {
                    m.enabled = false;
                });
            },
            startProxy: function () {
                this.showAlert = false;
            }
        }

    }
</script>