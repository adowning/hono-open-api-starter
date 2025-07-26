import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/main.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createHead } from '@vueuse/head'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { plugin as pinia } from './stores'

async function initializeApp() {
    const app = createApp(App)
    const head = createHead()

    app.use(head)
    app.use(pinia)
    app.use(VueQueryPlugin) // Install Vue Query before initializing stores

    // Setup realtime updates event listeners

    app.use(router)
    app.mount('#app')
}

initializeApp()
