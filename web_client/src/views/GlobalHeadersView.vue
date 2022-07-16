
<template>
    <v-container fluid>
        <h2>{{title}} {{port}}</h2>
        <p>These headers will be returned on every mocked response</p>
        <v-item-group flat>
            <v-col><v-btn @click="addHeader()">Add Header + </v-btn></v-col>
            <v-list-item v-for="(item, i) in headerItems"
                         :key="i"
                         :value="item"
                         active-color=""
                         selectable="false">

                <v-col><v-text-field label="Header:" v-model="item.name" hide-details="true"></v-text-field></v-col>
                <v-col><v-text-field label="Value:" v-model="item.value" hide-details="true"></v-text-field></v-col>
                <v-col cols="2" align-self="start">
                    <v-btn @click="removeHeader(i)" text-align-top class="ma-2"
                           color="red">
                        <v-icon icon="mdi-cancel"></v-icon>
                    </v-btn>
                </v-col>
            </v-list-item>
        </v-item-group>
        <h4>
            <v-btn @click="submitHeaders()" text-align-top class="ma-2" 
      prepend-icon="mdi-cloud-upload"
                   color="blue">Save
            </v-btn>
        </h4>
    </v-container>
</template>

<script>
    import { sendHeadersToProxy } from '../actions/globalHeaderActions'
    export default {
        name: 'GlobalHeaders',
        props: ['port'],
        data: () => ({
            headerItems: [
                { name: '', value: '' },
                { name: '', value: '' },
                { name: '', value: '' },
            ],
            title: "Global Headers"
        }),
        mounted: function () {
            console.log("mounted!!");
            this.title = "Global Headers - Proxy running on port: ";
        },
        methods: {
            addHeader: async function () {
                this.headerItems.push({ name: "", value: "" });
            },
            removeHeader: async function (i) {
                this.headerItems = this.headerItems.filter((value, index, array) => index != i);
            },
            submitHeaders: async function () {
                sendHeadersToProxy(this.headerItems, this.port);
            }
        }

    }
</script>
