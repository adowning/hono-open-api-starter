<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useGameStore } from '@/stores/game.store';
import { computed, onMounted, ref, watch } from 'vue';
import { useEventManager } from '@/composables/EventManager'

const eventBus = useEventManager()
const gameStore = useGameStore();
const gameSpinStore = useGameSpinStore();
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
    await gameSpinStore.fetchTopWins();
  }
});
</script>

<template>
  <main class="overflow-hidden">
    <!-- <div class="background-container"> -->
    <!-- <img src="/images/starsbg.png" alt="Background" class="background-image" /> -->
    <Starfield class="star-overlay" />
    <div style="min-height: 80px"></div>
    <!-- <FlickeringGrid class="absolute left-0 top-0 w-full h-[900px] z-[9999]" /> -->
    <LiveWin />
    <GameCarousel />
    <AdCarousel />

    <RtgGameLauncher v-if="currentUser && gameActive" :gameId="'atlantis'" :sessionId="currentUser.id" />
    <SettingsView v-if="currentUser && settingsModal" />
    <!-- </div> -->
  </main>
</template>

<style scoped>
.background-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.star-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
}
</style>