/**
 * Progressive bootstrap: Mount after core plugins (Pinia + Router) are installed,
 * but keep other plugins lazy to avoid blocking UI.
 */
import { createApp } from 'vue'
import App from './App.vue'

const start = async () => {
  const app = createApp(App)

  // Install Pinia and Router BEFORE mounting so components using stores can render
  try {
    const [{ plugin: pinia }, { default: router }] = await Promise.all([
      import('./stores'),
      import('./router'),
    ])
    app.use(pinia)
    app.use(router)
  } catch (e) {
    console.error('Failed to install core plugins (pinia/router):', e)
  }

  // Mount ASAP after core plugins
  app.mount('#app')
  // @ts-expect-error diag
  window.__app_mounted = true

  // Lazy install non-core plugins
  try {
    const [{ createHead }, { VueQueryPlugin }] = await Promise.all([
      import('@vueuse/head'),
      import('@tanstack/vue-query'),
    ])
    try {
      app.use(createHead())
    } catch (e) {
      console.error('head plugin failed', e)
    }
    try {
      app.use(VueQueryPlugin)
    } catch (e) {
      console.error('vue-query plugin failed', e)
    }
  } catch (e) {
    console.error('Deferred non-core plugin setup failed', e)
  }

  // Kick off auth initialization non-blocking
  try {
    const { useAuthStore } = await import('./stores/auth.store')
    const authStore = useAuthStore()
    authStore.init().catch((e: unknown) => console.error('auth init error', e))
  } catch (e) {
    console.error('auth store init wiring failed', e)
  }
}

start()

// Import styles last to avoid CSS loader blocking
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/main.css'