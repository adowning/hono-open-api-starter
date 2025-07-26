<!-- /tmp/hono-open-api-starter/frontend/src/components/AnimationLayer.vue -->
<template>
  <div class="animation-layer">
    <component
      v-for="anim in animations"
      :key="anim.id"
      :is="anim.component"
      v-bind="anim.props"
      :style="anim.style"
      class="animation-sprite"
    />
  </div>
</template>

<script setup lang="ts">
import { useAnimationLayer } from '@/composables/useAnimationLayer'

const { animations } = useAnimationLayer()
</script>

<style scoped>
.animation-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  pointer-events: none;
  z-index: 1000; /* Ensure it's on top of most other UI elements */
  overflow: hidden;
}

.animation-sprite {
  position: absolute;
  /* Individual sprites can override pointer-events if they need to be interactive */
}
</style>
