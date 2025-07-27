import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        vueDevTools(),
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia', ],
            dirs: ['src/stores', 'src/composables','/localforage/dist'],
            dts: 'src/auto-imports.d.ts',
            vueTemplate: true,
        }),
        Components({
            dirs: ['src/components'],
            dts: 'src/components.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        outDir: 'dist',

        // Other build options...
    },
})
