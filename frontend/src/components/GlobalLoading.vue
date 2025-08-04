<template>
  <teleport to="body">
    <!-- Use named transition to control timings via CSS below -->
    <Transition name="global-loading-fade" appear>
      <div
        v-if="isVisible"
        ref="loadingElement"
        class="loading-container"
        data-testid="global-loading"
        :style="{ zIndex: 9999 }"
      >
        <div class="loading-content">
          <img src="/images/logo.png" alt="Loading..." class="w-48 h-auto mb-8 animate-pulse">
        </div>
        <img class="w-16 h-16" src="/images/loading.svg" alt="Loading spinner">
      </div>
    </Transition>
  </teleport>
</template>
<script setup lang="ts">
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
<style>
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
  transition: opacity 140ms ease-out; /* ensures container has baseline transition too */
  z-index: 9999;
  pointer-events: auto;
  /* Ensure it's above everything except modals */
  isolation: isolate;
}

/* Quick fade-in, slower fade-out */
.global-loading-fade-enter-active {
  transition: opacity 140ms ease-out;
  will-change: opacity;
}
.global-loading-fade-leave-active {
  /* Start fading sooner with a quicker start, then ease out */
  transition: opacity 220ms cubic-bezier(0.2, 0.0, 0.2, 1);
  will-change: opacity;
}
.global-loading-fade-enter-from,
.global-loading-fade-leave-to {
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

/* Removed debug styles */

/* Ensure no other elements can interfere */
.loading-container * {
  position: relative;
  z-index: 10000;
}
</style>