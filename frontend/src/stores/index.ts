import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'
import type { Plugin } from 'vue'

export const pinia = createPinia()

export const plugin: Plugin = (app) => {
    const installPersistedStatePlugin = createPersistedStatePlugin()
    pinia.use((context) => installPersistedStatePlugin(context))

    app.use(pinia)
}
