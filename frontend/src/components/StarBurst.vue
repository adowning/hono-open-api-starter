<template>
  <div class="star-burst-container">
    <img v-for="star in stars" :key="star.id" :src="star.src" class="star" :style="star.style" alt="Shining star" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const starImages = [
  '/images/stars/particle02.png',
  '/images/stars/particle03.png',
  '/images/stars/particle05.png',
  '/images/stars/star0.avif',
  '/images/stars/star1.avif',
  '/images/stars/star2.avif',
  '/images/stars/star3.avif',
];

interface Star {
  id: number;
  src: string;
  style: Record<string, string | number>;
}

const stars = ref<Star[]>([]);
const numStars = 30; // Number of stars to generate

onMounted(() => {
  for (let i = 0; i < numStars; i++) {
    const randomImage = starImages[Math.floor(Math.random() * starImages.length)];
    const angle = Math.random() * 360; // Random angle for spiral direction
    const distance = 50 + Math.random() * 150; // Random distance from center
    const duration = 2 + Math.random() * 5; // Random animation duration (2s to 5s)
    const delay = Math.random() * 1; // Random delay to stagger animations

    stars.value.push({
      id: i,
      src: randomImage,
      style: {
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
        'animation-duration': `${duration}s`,
        'animation-delay': `${delay}s`,
        'z-index': 9999,
      },
    });
  }
});
</script>

<style scoped>
.star-burst-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 1px;
  z-index: -1;
  /* Behind the card */
}

.star {
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  /* Adjust size as needed */
  height: 30px;
  opacity: 1;
  z-index: 9999;
  animation: spiral-out 5s forwards;
}

@keyframes spiral-out {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0.1);
    opacity: 0;
  }

  20% {
    transform: translate(calc(cos(var(--angle)) * var(--distance) / 4), calc(sin(var(--angle)) * var(--distance) / 4)) rotate(180deg) scale(1.2);
    opacity: 1;
  }

  100% {
    transform: translate(calc(cos(var(--angle)) * var(--distance)), calc(sin(var(--angle)) * var(--distance))) rotate(720deg) scale(0.5);
    opacity: 0;
  }
}
</style>
