<template>
  <teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" ref="loadingElement" class="loading-container" :class="{ 'debug-mode': true }"
        data-testid="global-loading" :style="{ zIndex: 9999 }">
        <div class="loading-content">
          <img src="/images/logo.png" alt="Loading..." class="w-48 h-auto mb-8 animate-pulse">
        <!-- <SpriteAnimator :animation-data="LogoJson" image-url="/images/bottom/logo_shine_trans.png" :width="80"
        :height="80" :frame-count="LogoJson.frames.length" :initial-delay-max="5" :loop-delay="7" />-->
        </div> 
  <img class="w-16 h-16"
            src="/images/loading.svg"
            alt="Loading spinner">
      </div>
    </Transition>
  </teleport>
</template>
<script setup lang="ts">
import LogoJson from '@/assets/anim/logo_shine.json'
import { useAppStore } from '@/stores/app.store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, ref, watch } from 'vue'

const appStore = useAppStore()
const { globalLoading } = storeToRefs(appStore)
const isVisible = ref(false)
const loadingElement = ref<HTMLElement | null>(null)

const updateLoadingState = (isLoading: boolean) => {
  if (isLoading) {
    document.body.classList.add('loading-active')
    isVisible.value = true
  } else {
    document.body.classList.remove('loading-active')
    void document.body.offsetHeight
    isVisible.value = false
  }

}

updateLoadingState(globalLoading.value)

// Watch for changes to globalLoading
const unwatch = watch(globalLoading, (newVal) => {
  updateLoadingState(newVal)
})



// Cleanup
onBeforeUnmount(() => {
  unwatch()
  document.body.style.overflow = ''
})

// Expose debug methods
</script>
<style >
/* Add this at the top of your style section */
:global(body.loading-active) {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Update the loading container styles */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  pointer-events: auto;
  /* Ensure it's above everything except modals */
  isolation: isolate;
}

/* Update transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-icon {
  /* animation: spin 1s linear infinite; */
  /* will-change: transform; */
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Debug styles */
.loading-container[data-debug="true"] {
  outline: 2px solid red;
  outline-offset: -2px;
}

/* Ensure no other elements can interfere */
.loading-container * {
  position: relative;
  z-index: 10000;
}
</style>