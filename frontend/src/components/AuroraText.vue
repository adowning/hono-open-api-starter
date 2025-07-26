<script setup lang="ts">
  interface AuroraTextProps {
    className?: string
    colors?: string[]
    speed?: number
  }
  const props = withDefaults(defineProps<AuroraTextProps>(), {
    colors: () => ['#FF0080', '#7928CA', '#0070F3', '#38bdf8'],
    // colors: () => ['#ffff', '#ff9800', '#ffc107', '#ffea00'],
    // colors: () => ['#ffea00', '#ffea00', '#ffff', '#ffea00', '#ffea00'],
    speed: 1,
  })
  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${props.colors.join(', ')}, ${props.colors[0]})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animationDuration: `${10 / props.speed}s`,
    fontFamily: 'onacona',
  }
</script>

<template>
  <span :class="`relative inline-block ${props.className}`">
    <span class="sr-only">
      <slot />
    </span>
    <span
      class="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
      :style="gradientStyle"
      aria-hidden="true"
    >
      <slot />
    </span>
  </span>
</template>
<style scoped>
  .animate-aurora {
    /* animation-duration: infinite;
     animation-name: aurora
  animation-duration: 1s; */
    animation: aurora 12s ease-in-out infinite alternate;

    /* animate: aurora 1s ease-in-out infinite; */
  }
  @keyframes aurora {
    0% {
      background-position: 0% 50%;
      transform: rotate(-5deg) scale(0.9);
    }
    25% {
      background-position: 50% 100%;
      transform: rotate(5deg) scale(1.1);
    }
    50% {
      background-position: 100% 50%;
      transform: rotate(-3deg) scale(0.95);
    }
    75%: {
      background-position: 50% 0%;
      transform: rotate(3deg) scale(1.05);
    }
    100% {
      background-position: 0% 50%;
      transform: rotate(-5deg) scale(0.9);
    }
  }
</style>
