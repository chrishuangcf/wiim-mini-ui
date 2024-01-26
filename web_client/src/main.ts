import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";

createApp(App).use(createPinia()).use(router).use(vuetify).mount("#app");
