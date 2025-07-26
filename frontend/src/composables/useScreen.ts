import { onMounted, onUnmounted, ref } from 'vue'

export function useScreen() {
  const isMobile = ref(window.innerWidth <= 430)

  const onResize = () => {
    isMobile.value = window.innerWidth <= 430
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return { isMobile }
}
