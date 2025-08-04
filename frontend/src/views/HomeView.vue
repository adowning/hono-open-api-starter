spacecatka<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useGameStore } from '@/stores/game.store';
import { computed, onMounted, ref, watch, onUnmounted } from 'vue';
import { useEventManager } from '@/composables/EventManager'
import type { PreloadManifest } from '@/composables/useImagePreloader'

const eventBus = useEventManager()
const gameStore = useGameStore();
const gameSpinStore = useGameSpinStore();
const authStore = useAuthStore();
const settingsModal = ref(false);

// Track filter coming from FilterBar; default to 'all'
const selectedFilter = ref<'all' | 'fish' | 'slots'>('all')

// Derived list for GameCarousel: do not mutate the store
const visibleGames = computed(() => {
  const list = gameStore.games as Array<{ category?: string }>
  const f = selectedFilter.value
  if (f === 'all') {
    // union of slots + fish only
    return list.filter(g => {
      const c = (g.category ?? '').toLowerCase()
      return c === 'slots' || c === 'fish'
    })
  }
  const wanted = f === 'fish' ? 'fish' : 'slots'
  return list.filter(g => (g.category ?? '').toLowerCase() === wanted)
})

const currentUser = computed(() => authStore.currentUser);
const gameActive = ref(false)

// Build above-the-fold asset manifest for HomeView.
// Keep this minimal: only assets that must be ready at first paint.
 function getHomeAboveTheFoldAssets(): PreloadManifest {
  return {
    images: [
      { url: '/images/games/tall-field.avif', critical: true },
      { url: '/images/games/featured.webp', critical: true },
      { url: '/images/games/hand-banner-black.png', critical: false },
    ],
    json: [
      // Add any Lottie JSON here if used above-the-fold:
      // { url: '/animations/intro.json', critical: true }
    ],
  }
}

// Optionally, if you have route-level gating elsewhere, you can export this for the root to consume.
defineExpose({ getHomeAboveTheFoldAssets })

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

// Handle FilterBar event
const onFilterChange = (f: 'all' | 'fish' | 'slots') => {
  selectedFilter.value = f
}
</script>

<template>
  <main class="overflow-hidden">
    <Starfield class="star-overlay" />
    <div style="min-height: 80px"></div>

    <!-- Reserved vertical space to prevent layout shift when LiveWin mounts -->
    <section
      class="relative w-full overflow-hidden"
      style="min-height: clamp(72px, 12vw, 120px)"
      aria-label="Recent live wins"
    >
      <!-- Optional lightweight skeleton/placeholder; occupies same height -->
      <div class="absolute inset-0 animate-pulse bg-gradient-to-b from-white/5 to-white/0 dark:from-white/10 dark:to-white/0"></div>
      <LiveWin class="relative" />
    </section>

    <GameCarousel :games="visibleGames" />
    <FilterBar @filterChanged="onFilterChange" />
    <AdCarousel />

    <RtgGameLauncher v-if="currentUser && gameActive" :gameId="'atlantis'" :sessionId="currentUser.id" />
    <SettingsView v-if="currentUser && settingsModal" />
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

/* Ensure LiveWin content never expands the reserved height unexpectedly */
section[aria-label="Recent live wins"] > :deep(*) {
  /* If LiveWin internally uses flex/rows, this prevents accidental vertical overflow */
  max-height: clamp(72px, 12vw, 120px);
  overflow: hidden;
}
</style>