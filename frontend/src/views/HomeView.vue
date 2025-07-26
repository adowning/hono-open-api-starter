<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useGameStore } from '@/stores/game.store';
import { computed, onMounted, ref, watch } from 'vue';
import { useEventManager } from '@/composables/EventManager'

const eventBus = useEventManager()
const gameStore = useGameStore();
const authStore = useAuthStore();
const settingsModal = ref(false);

const currentUser = computed(() => authStore.currentUser);
const gameActive = ref(false)

watch(
  () => gameStore.games,
  (games) => {
    if (games.length > 0) {
      setTimeout(async () => {
        // const g = games.find(game => game.id === '13511');
        // await gameStore.enterGame(g.id,)
      }, 1000)
    }
  },
  { immediate: true }
);
const handleSettingsModal = (value: unknown) => {
  if (typeof value === 'boolean') {
    settingsModal.value = value
  }
}

eventBus.on('settingsModal', (value: unknown) => {
  settingsModal.value = value as boolean
})

onUnmounted(() => {
  eventBus.off('settingsModal', handleSettingsModal)
})
onMounted(async () => {
  if (gameStore.games.length === 0) {
    await gameStore.fetchAllGames();
  }
});
</script>

<template>
  <main>
    <GameCarousel />
    <RtgGameLauncher v-if="currentUser && gameActive" :gameId="'atlantis'" :sessionId="currentUser.id" />
    <SettingsView v-if="currentUser && settingsModal" />
  </main>
</template>
