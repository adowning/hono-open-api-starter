import { ref } from 'vue'

export function useImagePreloader(imageUrls: string[]) {
  const imagesLoaded = ref(false)
  const loadedImages = ref<string[]>([])
  const failedImages = ref<string[]>([])

  const preloadImages = async () => {
    const promises = imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.src = url
        img.onload = () => {
          loadedImages.value.push(url)
          resolve()
        }
        img.onerror = () => {
          console.log( `Failed to load image: ${url}`)
          failedImages.value.push(url)
          // Resolve even on error to not block the app
          resolve()
        }
      })
    })

    try {
      await Promise.all(promises)
    }
    finally {
      imagesLoaded.value = true
    }
  }

  return {
    imagesLoaded,
    preloadImages,
    loadedImages,
    failedImages,
  }
}
