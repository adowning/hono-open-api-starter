<script setup lang="ts">
import { computed, onMounted } from 'vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Notification from '@/components/common/Notification.vue'
import AnimationLayer from '@/components/AnimationLayer.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const isLogin = computed(() => router.currentRoute.value.path === '/login')

const isAuthenticated = computed(() => !!authStore.isAuthenticated)

const showLoader = computed(() => !isLogin.value)

const showChrome = computed(() => {
  const user = authStore.currentUser
  const notInGame = !user || user.currentGameSessionDataId == null
  return isAuthenticated.value && notInGame && !isLogin.value
})

onMounted(() => {
  if (isLogin.value) {
    document.body.classList.remove('loading-active')
  }
})
</script>

<template>
  <component :is="AnimationLayer" v-if="AnimationLayer" />

  <component :is="GlobalLoading" v-if="showLoader" />

  <component :is="Header" v-if="showChrome" />
  <router-view />
  <component :is="Footer" v-if="showChrome" />

  <component :is="Notification" v-if="Notification" />
</template>