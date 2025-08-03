<template>
  <div v-if="displayWinners.length > 10" class="marquee-container w-full overflow-hidden relative group">
    <ul class="marquee-content flex list-none m-0 p-0 will-change-transform gap-2">
      <LiveWinItem 
        v-for="(winner, index) in displayWinners" 
        :key="winner.id"
        :winner="winner"
        style="max-width: 280px"
      />
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LiveWinItem from './LiveWinItem.vue';
import { useGameSpinStore } from '@/stores/gamespin.store';

const gameStore = useGameSpinStore();
const sourceWinners = computed(() => gameStore.topWins || []);
let x = 0
const mappedWinners = computed(() => 

sourceWinners.value.map((item) => ({
    id: x++,
    imageUrl: `https://images.cashflowcasino.com/all/${item.gameName.toLowerCase()}.avif`,
    gameName: item.gameName,
    name: item.playerName,
    amount: item.winAmount?.toString() ?? '0',
    location: 'Anytown, USA'
  }))
);
const contentFilledWinners = computed(() => {
  const minItemsToFill = 10; // A reasonable minimum to ensure the container width is always exceeded.
  const winnersList = mappedWinners.value;
  if (!winnersList.length) return [];
  let newWinnerList = [];
  while (newWinnerList.length < minItemsToFill) {
    newWinnerList.push(...winnersList);
  }
  return newWinnerList;
});

const displayWinners = computed(() => {
    return [...contentFilledWinners.value, ...contentFilledWinners.value];
});
</script>

<style scoped>
.marquee-container {
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.marquee-content {
  /* animation: scroll-left 5s linear infinite; */
      display: inline-flex; 
  flex-wrap: nowrap;
  animation: scroll-left 1195s linear infinite;
}
/* .group:hover .marquee-content { */
  /* animation-play-state: paused; */

/* } */
@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    /* Change this from -100% */
    transform: translateX(-50%); 
  }
}
</style>
