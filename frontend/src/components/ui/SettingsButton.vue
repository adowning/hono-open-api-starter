<script setup lang="ts">
import { useEventManager } from '@/composables/EventManager'

const eventBus = useEventManager()

function openSettings() {
  eventBus.emit('settingsModal', true)
}
</script>

<template>
    <div class="flex flex-col items-center text-white">
        <img style="
          top: 0px;
          right: 8px;
          gap: 0px;
          margin: 0px;
          padding: 0px;
          background-size: cover;
          z-index: 999999;
        " src="/images/layout/settings.avif" @click="openSettings" />
    </div>
</template>