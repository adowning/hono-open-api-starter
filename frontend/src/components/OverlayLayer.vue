<script setup>
  defineProps({
    zIndex: {
      type: String,
      default: 'z-50',
    },
    type: {
      type: String,
      default: 'flex',
    },
    showOverlay: {
      type: Boolean,
      default: true,
    },
  })

  const emit = defineEmits(['overlayClick'])

  function overlayClick(event) {
    emit('overlayClick', event)
  }
</script>

<template>
  <div
    :class="[type, zIndex]"
    class="items-center flex-col justify-center overflow-hidden fixed inset-0"
  >
    <Transition
      enter-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showOverlay"
        class="overlay absolute inset-0 bg-linear-to-tr opacity-90 dark:from-gray-700 dark:via-gray-900 dark:to-gray-700"
        @click="overlayClick"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="animate-fade-out"
    >
      <slot />
    </Transition>
  </div>
</template>
