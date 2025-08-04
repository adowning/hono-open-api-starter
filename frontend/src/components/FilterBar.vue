<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import AllJson from '@/assets/anim/part0.json'
  import FishJson from '@/assets/anim/part2.json'
  import SlotsJson from '@/assets/anim/part1.json'
  import { useGameStore } from '@/stores/game.store'

  const display = ref(true)
  // Track the selected filter
  const selectedFilter = ref<'all' | 'fish' | 'slots'>('all')

  // Pinia store (frontend alias pointing to admin store path mapping)
  const gameStore = useGameStore()

  // Define emits for carousel scrolling and filter change
  const emit = defineEmits<{
    scrollLeft: []
    scrollRight: []
    filterChanged: [filter: 'all' | 'fish' | 'slots']
  }>()

  // Handle arrow clicks
  const handleScrollLeft = (): void => {
    emit('scrollLeft')
  }

  const handleScrollRight = (): void => {
    emit('scrollRight')
  }

  /**
   * IMPORTANT: Avoid mutating the Pinia store from here to prevent
   * recursive update loops in HomeView. We only emit the choice.
   * The parent or the store should derive a filtered list reactively.
   */
  const selectFilter = (filterName: 'all' | 'fish' | 'slots'): void => {
    if (selectedFilter.value === filterName) {
      // Avoid redundant emits to reduce parent work
      return
    }
    selectedFilter.value = filterName
    emit('filterChanged', filterName)
  }

  // Provide a derived read-only, local filtered list if the parent binds to it.
  // This does NOT write back to the store, preventing infinite loops.
  const filteredGames = computed(() => {
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

  // expose for parent if needed
  defineExpose({ filteredGames, selectedFilter })
</script>

<template>
  <div class="flex flex-row justify-center m-0" style="max-width: fit-content; margin-inline: auto">
    <div
      v-show="display"
      class="basis-1/2 animate__animated animate__fadeIn flex justify-between "
      style="
        background-color: white !important;
        z-index: 21;
        background-repeat: no-repeat;
        background-color: transparent;
        justify-content: center;
        width: 100%;
        max-height: 85px; /* Adjusted height to fit background */
        align-items: center;
      "
    >
      <img
        src="/images/filterbar/side-arrow-prev.avif"
        class="mr-2 flex cursor-pointer"
        style="text-align: center"
        @click="handleScrollLeft"
      />

      <div
        class="filter-item bottomDropper ml-2"
        :class="{ selected: selectedFilter === 'all' }"
        @click="selectFilter('all')"
      >
        <SpriteAnimator
          :animation-data="AllJson"
          image-url="/images/filterbar/part0.png"
          :width="60"
          :height="60"
          :frame-count="AllJson.frames.length"
          :initial-delay-max="0"
          :loop-delay="4"
          :framerate="30"
        />
      </div>

      <div
        class="filter-item bottomDropper"
        :class="{ selected: selectedFilter === 'fish' }"
        @click="selectFilter('fish')"
      >
        <SpriteAnimator
          :animation-data="FishJson"
          image-url="/images/filterbar/part2.png"
          :width="65"
          :height="65"
          :frame-count="FishJson.frames.length"
          :initial-delay-max="0"
          :loop-delay="0"
          :framerate="20"
        />
      </div>

      <div
        class="filter-item bottomDropper pt-2"
        :class="{ selected: selectedFilter === 'slots' }"
        @click="selectFilter('slots')"
      >
        <SpriteAnimator
          :animation-data="SlotsJson"
          image-url="/images/filterbar/part1.png"
          :width="60"
          :height="60"
          :frame-count="SlotsJson.frames.length"
          :initial-delay-max="0"
          :loop-delay="0"
          :framerate="20"
        />
      </div>

      <img
        src="/images/filterbar/side-arrow.avif"
        class="ml-2 flex cursor-pointer"
        style="text-align: center"
        @click="handleScrollRight"
      />
    </div>
  </div>
</template>

<style scoped>
  .bottomDropper {
    --animate-duration: 0.3s;
  }

  .filter-item {
    cursor: pointer;
    width: 85px;
    height: 85px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* Background for when the item is NOT selected */
    background-image: url('/images/filterbar/button-dead.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    transition: all 0.2s ease-in-out;
  }

  .filter-item.selected {
    /* Background for when the item IS selected */
    background-image: url('/images/filterbar/button-on.png');
  }

  /* Your existing styles */
  .div --active {
    background-color: transparent;
    margin-top: 5px;
  }

  .van-tabbar {
    height: 42px;
    font-family: 'bungeecolor';
  }
</style>