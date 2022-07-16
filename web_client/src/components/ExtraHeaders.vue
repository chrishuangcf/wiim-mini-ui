<template>
        <v-item-group flat class="pb-6">
            <v-col class="pl-0"><v-btn @click="addHeader()" color="light-green"
                         density="comfortable">Add Extra Header + </v-btn></v-col>
            <v-list-item v-for="(item, i) in headerItems"
                         :key="i"
                         :value="item"
                         active-color=""
                         selectable="false"
                         density="compact"
                         class="pa-0">

                <v-col class="pa-2" ><v-text-field class="pa-0" density="compact" label="Header:" v-model="item.key" hide-details="true"></v-text-field></v-col>
                <v-col class="pa-2" ><v-text-field class="pa-0" density="compact" label="Value:" v-model="item.value" hide-details="true"></v-text-field></v-col>
                <v-col cols="2" align-self="start" class="pa-2" >
                    <v-btn @click="removeHeader(i)" text-align-top class="ma-2" color="red" density="comfortable">
                        <v-icon icon="mdi-cancel"></v-icon>
                    </v-btn>
                </v-col>
            </v-list-item>
        </v-item-group>
</template>

<script>
    export default {
        name: 'ExtraHeaders',
        props: ['port', 'extraheadersproperty'],
        data: () => ({
            headerItems: [
                { key: '', value: '' },
                { key: '', value: '' }
            ],
            title: "Extra Headers"
        }),
        mounted: function () {
            console.log("Extra Headers mounted!!");
        },
        watch: {
            extraheadersproperty(newValue, oldValue) {
                this.headerItems = newValue;
            }
        },
        methods: {
            addHeader: async function () {
                this.headerItems.push({ key: "", value: "" });
            },
            removeHeader: async function (i) {
                this.headerItems = this.headerItems.filter((value, index, array) => index != i);
                this.$emit('update:extraheadersproperty', this.headerItems); // update is the actual event name the parent will listen for
            }
        }

    }
</script>
