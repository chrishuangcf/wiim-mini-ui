<template>
    <v-container fluid class="logs">
        <h2>{{title}}</h2>
    </v-container>
</template>

<script>
  export default {
    name: 'LogsView',

        data: () => ({
            title:"Logs and Traffic"
        })
  }
</script>

<style>
@media (min-width: 1024px) {
  .logs {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
