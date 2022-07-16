<template>
    <v-card elevation="2" >
        <v-container fluid>
            <!--<h2>{{title}} Port: {{port}}</h2>-->
            <h2 class="pb-4">
                {{mock?.endpoint}}
            </h2>
            <v-text-field label="Notes:" v-model="mock.documentation"></v-text-field>
            <v-text-field label="Endpoint:" v-model="mock.endpoint"></v-text-field>
            <v-layout>
                <v-row>
                    <v-col>
                        <SelectedMethod v-model:selectedmethodproperty="mock.method"></SelectedMethod>
                    </v-col>
                    <v-col>
                        <SelectedStatusCode v-model:selectedstatuscodeproperty="mock.responses[0].statusCode"></SelectedStatusCode>
                    </v-col>
                </v-row>
            </v-layout>
            <v-layout>
                <v-row>
                    <v-col>
                        <v-text-field prepend-icon="mdi-clock" label="Delay in Milliseconds:" v-model="mock.responses[0].latency"></v-text-field>
                    </v-col>
                    <v-col>
                    </v-col>
                </v-row>
            </v-layout>

            <ExtraHeaders v-model:extraheadersproperty="mock.responses[0].headers"></ExtraHeaders>
            <v-textarea label="Body:" v-model="mock.responses[0].body"></v-textarea>
        </v-container>
    </v-card>
</template>

<script>
    import SelectedMethod from '../components/SelectedMethod.vue'
    import SelectedStatusCode from '../components/SelectedStatusCode.vue'
    import ExtraHeaders from '../components/ExtraHeaders.vue'

    export default {
        name: 'SelectedEndpoint',
        props: ['port', 'mock'],
        components: {
            "SelectedMethod": SelectedMethod,
            "SelectedStatusCode": SelectedStatusCode,
            "ExtraHeaders": ExtraHeaders,
        },
        data: () => ({
            title: "SelectedEndpoint"
        }),
        mounted: function () {
            console.log("mounted SelectedEndpoint!");
            this.title = "SelectedEndpoint Component.";
        },
        watch: {
            mock(newValue, oldValue) {
            }
        },
        methods: {
            setProp: async function () {
            },
        }
    }
</script>
