<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Notification from '@/components/common/Notification.vue'
import AnimationLayer from '@/components/AnimationLayer.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth.store'
import { useImagePreloader, type PreloadManifest } from '@/composables/useImagePreloader'
import { SplashScreen } from '@capacitor/splash-screen'

// Root gate: do not show UI until critical Home assets are loaded (mobile-first)
const authStore = useAuthStore()
const preloader = useImagePreloader()

// Manifest builder for above-the-fold assets on initial route (Home by default).
// Keep minimal and only include images/JSON needed for first paint.
function getInitialManifest(): PreloadManifest {
  // Static UI chrome assets that may flash if not preloaded
  const chromeImages = [
    '/images/games/tall-field.avif',
    '/images/games/featured.webp',
    '/images/games/hand-banner-black.png',
  ]

  return {
    images: chromeImages.map((url) => ({ url, critical: false })),
    json: [], // Add Lottie JSON here if you have a global animation on first render
    fetches: [], // Add any warm fetches if absolutely needed
  }
}

const isLogin = computed(() => router.currentRoute.value.path === '/login')
const isAuthenticated = computed(() => !!authStore.isAuthenticated)

// Only show loader overlay while we are gating; respect login route to avoid double splash
const isGateReady = ref(false)
/**
 * Ensure GlobalLoading shows during the initial gate on refresh:
 * - showLoader drives GlobalLoading visibility via app store (see onMounted below).
 * - Keep loader on for all routes except /login to avoid double splash.
 */
const showLoader = computed(() => !isLogin.value && !isGateReady.value)

const showChrome = computed(() => {
  const user = authStore.currentUser
  const notInGame = !user || user.currentGameSessionDataId == null
  return isAuthenticated.value && notInGame && !isLogin.value && isGateReady.value
})

async function runPreloadGate() {
  // Record the time we enter the gate to enforce a minimum visible duration
  const gateStart = performance.now?.() ?? Date.now()
  try {
    // Ensure the global loading overlay engages during the preload gate
    const { useAppStore } = await import('@/stores/app.store')
    const appStore = useAppStore()
    appStore.globalLoading = true
    // Keep native splash visible while we preload
    await SplashScreen.show()

    // Initialize preloader with minimal chrome and route-level manifest
    await preloader.initialize(getInitialManifest())
    await preloader.waitForReady()
  } catch {
    // If critical assets fail, we still proceed to avoid hard-blocking; errors logged in composable
  } finally {
    // Enforce a minimum splash visibility of 1000ms
    const elapsed = (performance.now?.() ?? Date.now()) - gateStart
    const minMs = 1000
    if (elapsed < minMs) {
      await new Promise((r) => setTimeout(r, minMs - elapsed))
    }

    isGateReady.value = true

    // Hide the global loader once the gate is ready
    const { useAppStore: useAppStore2 } = await import('@/stores/app.store')
    const appStore2 = useAppStore2()
    appStore2.globalLoading = false
    // Allow CSS leave transition to run before hiding native splash
    await new Promise((r) => setTimeout(r, 320)) // match leave duration in GlobalLoading
    // Hide native splash when ready
    await SplashScreen.hide()
    // Remove any legacy CSS loaders
    document.body.classList.remove('loading-active')
  }
}

onMounted(() => {
  // Do not gate login route; hide splash immediately for login UX
  if (isLogin.value) {
    SplashScreen.hide().catch(() => {})
    document.body.classList.remove('loading-active')
    isGateReady.value = true
  } else {
    void runPreloadGate()
  }
})
</script>

<template>
  <component :is="AnimationLayer" v-if="AnimationLayer && isGateReady" />

  <!-- Global loading overlay while gating -->
  <component :is="GlobalLoading" v-if="showLoader" />

  <component :is="Header" v-if="showChrome" />
  <router-view v-if="isGateReady" />
  <component :is="Footer" v-if="showChrome" />

  <component :is="Notification" v-if="Notification && isGateReady" />
</template>