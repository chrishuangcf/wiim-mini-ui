<template>
    <v-select v-model="codeIndex"
              :items="codeValues"
              label="Status Code:"
              @update:modelValue="calculateCode">
    </v-select>
</template>

<script>

    export default {
        name: 'SelectedStatusCode',
        props: ['port', 'selectedstatuscodeproperty'],
        emits: ['update:selectedstatuscodeproperty'], // update is a reserved word
        data: function () {
            const codeValues = [
                100, 101,
                200, 201, 202, 203, 204, 218, 222,
                300, 301, 302, 303, 304,
                400, 401, 402, 403, 404, 418, 420,
                500, 501, 502, 503, 504, 505
            ];

            return {
                codeValues,
                codeIndex: codeValues[0],
            }
        },
        mounted: function () {
            console.log("mounted SelectedStatusCode!");
            this.title = "SelectedStatusCode Component.";
        },
        watch: {
            selectedstatuscodeproperty(newValue, oldValue) {
                this.codeIndex = newValue;
            }
        },
        methods: {
            calculateCode: function (value) {
                this.codeIndex = value;
                this.$emit('update:selectedstatuscodeproperty', value); // update is the actual event name the parent will listen for
            }
        }
    }
</script>