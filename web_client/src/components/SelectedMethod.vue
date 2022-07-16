<template>
    <v-select v-model="methodIndex"
              :items="methodValues"
              label="Method: "
              @update:modelValue="calculateMethodName">
    </v-select>
</template>

<script>

    export default {
        name: 'SelectedMethod',
        props: ['port', 'selectedmethodproperty'],
        emits: ['update:selectedmethodproperty'], // update is a reserved word
        data: function () {
            const methodValues = [
                'GET',
                'POST',
                'PUT',
                'DELETE',
                'OPTIONS',
                '***'
            ];

            return {
                methodValues,
                methodIndex: methodValues[0],
            }
        },
        mounted: function () {
            console.log("mounted SelectedMethod!");
            this.title = "SelectedMethod Component.";
        },
        watch: {
            selectedmethodproperty(newValue, oldValue) {
                this.methodIndex = newValue?.toUpperCase();
            }
        },
        methods: {
            calculateMethodName: function (value) {
                this.methodIndex = value;
                this.$emit('update:selectedmethodproperty', value); // update is the actual event name the parent will listen for
            }
        }
    }
</script>