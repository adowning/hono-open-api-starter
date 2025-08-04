import { ref, onUnmounted, type Ref } from 'vue'

/**
 * Default media dimensions used when an image fails to load or metadata is not available.
 * These values help stabilize layout and avoid content shift.
 */
export const DEFAULT_MEDIA = {
  width: 239,
  height: 145.19,
  get aspectRatio(): number {
    // width / height, guard against division by zero
    return this.height ? this.width / this.height : 1
  },
}

export type ImageState = 'loading' | 'loaded' | 'error'

export type ImageDimensions = {
  width: number
  height: number
  aspectRatio: number
}

/**
 * Encapsulates image preloading and derived background style calculation for game cards.
 * Framework-agnostic state and pure helpers to keep components clean and testable.
 */
export function useGameImageLoader(): {
  loaded: Ref<Set<string>>
  states: Ref<Map<string, ImageState>>
  dimensions: Ref<Map<string, ImageDimensions>>
  preload: (gameId: string, imageUrl: string) => void
  getState: (gameId: string) => ImageState | undefined
  getDimensions: (gameId: string) => ImageDimensions | undefined
  getBackgroundStyle: (
    gameId: string,
    imageUrl: string,
    containerAR?: number,
    options?: { isRedTiger?: boolean }
  ) => Record<string, string | number>
} {
  const loaded = ref<Set<string>>(new Set())
  const states = ref<Map<string, ImageState>>(new Map())
  const dimensions = ref<Map<string, ImageDimensions>>(new Map())

  // Track alive status to avoid state mutations after unmount, which can cause DOM patching errors
  let isAlive = true
  onUnmounted(() => {
    isAlive = false
  })

  /**
   * Preload an image by URL and capture its natural dimensions.
   * Idempotent per gameId to avoid redundant work.
   */
  const preload = (gameId: string, imageUrl: string): void => {
    if (!imageUrl) {
      states.value.set(gameId, 'error')
      return
    }
    if (loaded.value.has(gameId)) return

    states.value.set(gameId, 'loading')

    const img = new Image()
    // Ensure callbacks do not mutate reactive state after unmount
    img.onload = () => {
      if (!isAlive) return
      loaded.value.add(gameId)
      states.value.set(gameId, 'loaded')
      const width = img.naturalWidth || DEFAULT_MEDIA.width
      const height = img.naturalHeight || DEFAULT_MEDIA.height
      dimensions.value.set(gameId, {
        width,
        height,
        aspectRatio: height ? width / height : DEFAULT_MEDIA.aspectRatio,
      })
    }
    img.onerror = () => {
      if (!isAlive) return
      states.value.set(gameId, 'error')
      // Keep conservative defaults to avoid layout pop
      dimensions.value.set(gameId, {
        width: DEFAULT_MEDIA.width,
        height: DEFAULT_MEDIA.height,
        aspectRatio: DEFAULT_MEDIA.aspectRatio,
      })
    }
    img.src = imageUrl
  }

  const getState = (gameId: string): ImageState | undefined => {
    return states.value.get(gameId)
  }

  const getDimensions = (gameId: string): ImageDimensions | undefined => {
    return dimensions.value.get(gameId)
  }

  /**
   * Compute smart background sizing and style based on the loaded dimensions.
   * Optionally considers provider specifics (e.g., Red Tiger assets).
   *
   * containerAR: expected container aspect ratio (width / height).
   */
  const getBackgroundStyle = (
    gameId: string,
    imageUrl: string,
    containerAR: number = 0.608,
    options?: { isRedTiger?: boolean }
  ): Record<string, string | number> => {
    const state = states.value.get(gameId)
    if (state === 'loaded') {
      const dims = dimensions.value.get(gameId)
      const ar = dims?.aspectRatio ?? DEFAULT_MEDIA.aspectRatio

      // For Red Tiger or similar, we may prefer cover-by-height for taller images.
      // In practice, we can use the same branching but keep hook for future provider tuning.
      const useHeightFit = ar > containerAR ? true : false
      const backgroundSize =
        options?.isRedTiger
          ? useHeightFit
            ? 'auto 100%'
            : '100% auto'
          : useHeightFit
            ? 'auto 100%'
            : '100% auto'

      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
      }
    }

    // Loading or error: show no background, allow overlay to render.
    return {
      backgroundImage: 'none',
      backgroundSize: 'auto 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: 1,
    }
  }

  return {
    loaded,
    states,
    dimensions,
    preload,
    getState,
    getDimensions,
    getBackgroundStyle,
  }
}