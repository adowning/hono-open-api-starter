<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = defineProps({
    label: String,
    idleImage: String,
    pressedImage: String,
    // 9-slice values – adjust these to match your button image
    leftCap: { type: Number, default: 1 },
    rightCap: { type: Number, default: 1 },
    topCap: { type: Number, default: 1 },
    bottomCap: { type: Number, default: 1 },
  })

  defineEmits(['click'])

  const isPressed = ref(false)

  function pressButton() {
    isPressed.value = true
    // nextTick(() => {
    //   setTimeout(() => {
    //     nextTick(() => {
    //       console.log('going home')
    //       router.push('/home')
    //     })
    //   }, 100)
    // })
  }

  const buttonStyle = computed(() => {
    const image = isPressed.value ? props.pressedImage : props.idleImage
    const padding = `${props.topCap}px ${props.rightCap}px ${props.bottomCap}px ${props.leftCap}px`
    return {
      padding,
      backgroundImage: `url(${image})`,
      height: `52px`,
      width: '52px',
      backgroundSize: `calc(100% + ${props.leftCap}px + ${props.rightCap}px) calc(100% + ${props.topCap}px + ${props.bottomCap}px)`, // Stretchable background
      border: 'none',
      cursor: 'pointer',
      // Ensure the button stretches with the label
      display: 'inline-flex', // Use flexbox for alignment
      alignItems: 'center', // Vertically center
      justifyContent: 'center', // Horizontally center
    }
  })
</script>

<template>
  <div style="border-width: 0px">
    <button
      class="nine-slice-button"
      :style="buttonStyle"
      style="border-width: 0px"
      @mousedown="isPressed = true"
      @click="pressButton"
    >
      <span class="button-label">{{ label }}</span>
    </button>
  </div>
</template>

<style scoped>
  .nine-slice-button {
    /* Reset default button styles */
    background-color: transparent;
    /* Important for seeing the image */
    font-family: sans-serif;
    /* Or your preferred font */
    font-size: 16px;
    /* Or your preferred size */
    color: #333;
    /* Or your preferred color */
    white-space: nowrap;
    /* Prevent label from wrapping */
  }

  .button-label {
    /* Add any specific label styling here */
  }
</style>
