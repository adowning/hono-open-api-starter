<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Notification from '@/components/common/Notification.vue'
import { useScreen } from '@/composables/useScreen'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const { isMobile } = useScreen()
const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()
const gameStore = useGameStore()
const { setupEventListeners } = useRealtimeUpdates()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Initialize app when component is mounted
onMounted(async () => {
  setupEventListeners()

  if (authStore.accessToken) {
    appStore.showLoading()
    try {
      await Promise.all([
        authStore.getSession(),
        authStore.getSession(),
        gameStore.fetchAllGames(),
        gameStore.fetchAllGameCategories(),
      ])
      authStore.initWebSocket()
    } catch (error) {
      authStore.clearAuth()
      console.error('Failed to initialize app:', error)
    } finally {
      appStore.hideLoading()
    }
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
      <GlobalLoading />
      <Header v-if="authStore.isAuthenticated" />

      <main class="flex-grow overflow-hidden bg-black">
        <RouterView />
      </main>
      <Footer
        v-if="authStore.isAuthenticated && authStore.currentUser && authStore.currentUser.currentGameSessionDataId == null" />
      <Notification />
    </div>
  </div>
</template>
