import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'
import type { Plugin } from 'vue'
import localforage from 'localforage'

export const pinia = createPinia()

export const plugin: Plugin = (app) => {
    const installPersistedStatePlugin = createPersistedStatePlugin({
         storage: {
        getItem: async (key) => {
          return localforage.getItem(key)
        },
        setItem: async (key, value) => {
          return localforage.setItem(key, value)
        },
        removeItem: async (key) => {
          return localforage.removeItem(key)
        },
      },
    })
    pinia.use((context) => installPersistedStatePlugin(context))

    app.use(pinia)
}
