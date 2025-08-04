<template>
  <!-- Reserve height to prevent layout shift and keep element in DOM even when empty -->
  <div class="marquee-reserved w-full">
    <div
      v-show="displayWinners.length > 10"
      class="marquee-container w-full overflow-hidden relative group"
      role="region"
      aria-label="Recent winning players"
    >
      <ul class="marquee-content flex list-none m-0 p-0 will-change-transform gap-2">
        <LiveWinItem
          v-for="(winner, index) in displayWinners"
          :key="winner.id"
          :winner="winner"
          style="max-width: 280px"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LiveWinItem from './LiveWinItem.vue';
import { useGameSpinStore } from '@/stores/gamespin.store';

const gameStore = useGameSpinStore();
const sourceWinners = computed(() => gameStore.topWins || []);
let x = 0;

// Map incoming winners into display shape
// Define a minimal structural type to avoid 'any' and match existing payloads without over-constraining.
type SourceWinner = {
  id: string;
  playerName?: string;
  gamesName?: string;
  gameName?: string;
  grossWinAmount: number;
  winAmount?: number;
};

const mappedWinners = computed(() =>
  (sourceWinners.value as ReadonlyArray<SourceWinner>).map((item) => {
    // Use a narrowed local variable to avoid optional chaining on a union
    const resolvedGameName: string = (item.gameName ?? item.gamesName ?? '').toLowerCase();
    const rawAmount: number = (item.winAmount ?? item.grossWinAmount) ?? 0;
    return {
      id: x++,
      imageUrl: `https://images.cashflowcasino.com/all/${resolvedGameName}.avif`,
      gameName: item.gameName ?? item.gamesName,
      name: item.playerName,
      amount: String(rawAmount),
      location: 'Anytown, USA',
    };
  }),
);

// Ensure enough items to make marquee continuous
const contentFilledWinners = computed(() => {
  const minItemsToFill = 10;
  const winnersList = mappedWinners.value;
  if (!winnersList.length) return [];
  const newWinnerList: typeof winnersList = [];
  while (newWinnerList.length < minItemsToFill) {
    newWinnerList.push(...winnersList);
  }
  return newWinnerList;
});

// Duplicate for seamless scroll
const displayWinners = computed(() => [...contentFilledWinners.value, ...contentFilledWinners.value]);
</script>

<style scoped>
/* Reserve stable height to avoid pushing GameCarousel on async mount/render */
.marquee-reserved {
  /* Adjust height to match LiveWinItem height; use responsive clamp for safety */
  min-height: 56px;
  height: auto;
}

/* Mask edges for fade-in/out */
.marquee-container {
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

/* Continuous horizontal scrolling */
.marquee-content {
  display: inline-flex;
  flex-wrap: nowrap;
  animation: scroll-left 1195s linear infinite;
  will-change: transform;
}

@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
