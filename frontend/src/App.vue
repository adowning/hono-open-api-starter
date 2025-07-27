<script setup lang="ts">
import AnimationLayer from '@/components/AnimationLayer.vue'
import Footer from '@/components/Footer.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import Header from '@/components/Header.vue'
import Notification from '@/components/common/Notification.vue'
import { useImagePreloader } from '@/composables/useImagePreloader'
import { useRealtimeUpdates } from '@/composables/useRealtimeUpdates'
import { useScreen } from '@/composables/useScreen'
import { client } from '@/sdk/generated/client.gen'
import { useAppStore } from '@/stores/app.store'
import { useAuthStore } from '@/stores/auth.store'
import { useGameStore } from '@/stores/game.store'
import { watchOnce } from '@vueuse/core'
import { onMounted, onUnmounted } from 'vue'
import { imageUrls } from './image-preload-list'
import router from './router'

const { imagesLoaded, preloadImages } = useImagePreloader(imageUrls)
const { isMobile } = useScreen()
const authStore = useAuthStore()
const appStore = useAppStore()
const gameStore = useGameStore()
const gameSpinStore = useGameSpinStore()
const { setupEventListeners } = useRealtimeUpdates()
const _appReady = ref<boolean>(false)
const hasInitiated = ref(false)

const hydrating = ref(true)
authStore.$persistedState.isReady().then(() => {
  hydrating.value = false
})
const pending = computed(() => authStore.$persistedState.pending)
// Initialize app when component is mounted
watchOnce(pending, async (newVal) => {
  console.log(`is pending ${newVal}`)
  if (!newVal && hasInitiated.value == false) {
    hasInitiated.value = true
    if (authStore.accessToken !== null) {
      client.instance.interceptors.request.use((config) => {
        // do something
        config.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
        return config;
      });
      appStore.showLoading()
      try {
        const games = gameStore.games
        const gameSpins = gameSpinStore.topWins
        console.log(games)
        await Promise.all([
          authStore.getSession(),
          games.length ? gameStore.fetchAllGames() : null,
          gameSpins.length ? gameSpinStore.fetchTopWins() : null,
          // gameStore.fetchAllGameCategories(),
        ])
        authStore.initWebSocket()
      }
      catch (error) {
        _appReady.value = true
        appStore.hideLoading()

        authStore.clearAuth()
        router.push('/login')
        console.error('Failed to initialize app:', error)
      }
      finally {
        _appReady.value = true
        appStore.hideLoading()
        console.log('App is ready')

      }
    } else {
      _appReady.value = true
      appStore.hideLoading()

      authStore.clearAuth()
      router.push('/login')
    }
  }
})
onMounted(async () => {
  await preloadImages()
  setupEventListeners()
  console.log(hydrating.value)
  console.log(pending.value)
  console.log(router.currentRoute.value.path)
  if ((!hydrating.value && !pending.value) || router.currentRoute.value.path === '/login') {
    _appReady.value = true
  }
})

// Clean up when component is unmounted
onUnmounted(() => {
  authStore.closeWebSocket()
})
</script>

<template>
  <AnimationLayer />
  <div class="bg-black" :class="{ 'h-screen flex items-center justify-center': !isMobile }">
    <div class="relative flex flex-col bg-transparent dark:bg-transparent" :class="{
      'w-full h-full': isMobile,
      'max-w-[430px] max-h-screen w-full h-full shadow-2xl': !isMobile,
    }">
      <GlobalLoading v-if="appStore.globalLoading" />
      <template>
        <div v-if="imagesLoaded && _appReady" class="flex-grow bg-green w-full h-[100vh] overflow-hidden">
          <Header
            v-if="authStore.isAuthenticated && authStore.currentUser && authStore.currentUser.currentGameSessionDataId == null && router.currentRoute.value.path !== '/login'" />

          <main class=" flex-grow overflow-hidden bg-black">
            <RouterView />
          </main>
          <Footer
            v-if="authStore.isAuthenticated && authStore.currentUser && authStore.currentUser.currentGameSessionDataId == null && router.currentRoute.value.path !== '/login'" />
        </div>
        <div v-else>
          {{ authStore.isAuthenticated }}
          {{ authStore.currentUser }}
          {{ authStore.currentUser?.currentGameSessionDataId }}
          {{ router.currentRoute.value.path }}
        </div>

        <Notification />
      </template>
    </div>
  </div>
</template>