import { ref, computed, type Ref } from 'vue'

/**
 * Unified preloader for critical above-the-fold assets.
 * Supports images (with decode()), JSON (e.g., Lottie files), and generic fetches.
 * Exposes progress, state, and a waitForReady() promise to gate initial render.
 *
 * Usage:
 *  const preloader = useImagePreloader()
 *  preloader.initialize({
 *    images: [{ url: '/img/hero.webp', critical: true }],
 *    json: [{ url: '/anim/intro.json', critical: true }],
 *  })
 *  await preloader.waitForReady()
 */
export type PreloadState = 'idle' | 'loading' | 'ready' | 'error'

export type ImageAsset = {
  url: string
  critical?: boolean
  timeoutMs?: number
}

export type JsonAsset = {
  url: string
  critical?: boolean
  timeoutMs?: number
}

export type GenericAsset = {
  url: string
  critical?: boolean
  requestInit?: RequestInit
  timeoutMs?: number
}

export type PreloadManifest = {
  images?: ImageAsset[]
  json?: JsonAsset[] // Lottie JSON or any JSON required before first paint
  fetches?: GenericAsset[] // any HEAD/GET you want to warm
}

/** Internal helper: promise with timeout */
function withTimeout<T>(p: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  if (!timeoutMs || timeoutMs <= 0) return p
  return new Promise<T>((resolve, reject) => {
    const startedAt = performance.now?.() ?? Date.now()
    const to = setTimeout(() => {
      const dur = (performance.now?.() ?? Date.now()) - startedAt
      console.warn('[preloader] timeout', { label, timeoutMs, elapsedMs: Math.round(dur) })
      reject(new Error(`Timeout ${timeoutMs}ms while loading ${label}`))
    }, timeoutMs)
    p.then((v) => {
      clearTimeout(to)
      const dur = (performance.now?.() ?? Date.now()) - startedAt
      console.debug('[preloader] completed', { label, elapsedMs: Math.round(dur) })
      resolve(v)
    }).catch((e) => {
      clearTimeout(to)
      const dur = (performance.now?.() ?? Date.now()) - startedAt
      console.error('[preloader] failed', { label, elapsedMs: Math.round(dur), error: e instanceof Error ? e.message : String(e) })
      reject(e)
    })
  })
}

/** Preload and decode an image */
async function loadAndDecodeImage(url: string): Promise<void> {
  const t0 = performance.now?.() ?? Date.now()
  console.debug('[preloader:image] start', { url })
  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    ;(img as unknown as Record<string, unknown>).fetchPriority = 'high'
    img.src = url
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
  })
  try {
    const img = new Image()
    img.src = url
    const maybeDecodable = img as HTMLImageElement & Partial<{ decode: () => Promise<void> }>
    if (typeof maybeDecodable.decode === 'function') {
      await maybeDecodable.decode()
      const dur = (performance.now?.() ?? Date.now()) - t0
      console.debug('[preloader:image] decoded', { url, elapsedMs: Math.round(dur) })
    } else {
      const dur = (performance.now?.() ?? Date.now()) - t0
      console.debug('[preloader:image] loaded-no-decode', { url, elapsedMs: Math.round(dur) })
    }
  } catch (e) {
    const dur = (performance.now?.() ?? Date.now()) - t0
    console.warn('[preloader:image] decode-unsupported', { url, elapsedMs: Math.round(dur), info: e instanceof Error ? e.message : String(e) })
  }
}

/** Fetch and parse JSON */
async function fetchJson(url: string): Promise<unknown> {
  const t0 = performance.now?.() ?? Date.now()
  console.debug('[preloader:json] start', { url })
  const res = await fetch(url, { credentials: 'omit', cache: 'force-cache' })
  if (!res.ok) {
    const dur = (performance.now?.() ?? Date.now()) - t0
    console.error('[preloader:json] http-error', { url, status: res.status, elapsedMs: Math.round(dur) })
    throw new Error(`Failed to fetch JSON ${url}: ${res.status}`)
  }
  const data = await res.json()
  const dur = (performance.now?.() ?? Date.now()) - t0
  console.debug('[preloader:json] done', { url, elapsedMs: Math.round(dur), bytes: (res.headers.get('content-length') ?? 'unknown') })
  return data
}

/** Generic warm fetch (e.g., HEAD) */
async function warmFetch(url: string, init?: RequestInit): Promise<void> {
  const t0 = performance.now?.() ?? Date.now()
  console.debug('[preloader:fetch] start', { url, method: init?.method ?? 'GET' })
  const res = await fetch(url, init ?? { method: 'GET', credentials: 'omit', cache: 'force-cache' })
  if (!res.ok) {
    const dur = (performance.now?.() ?? Date.now()) - t0
    console.error('[preloader:fetch] http-error', { url, status: res.status, elapsedMs: Math.round(dur) })
    throw new Error(`Failed to warm fetch ${url}: ${res.status}`)
  }
  const dur = (performance.now?.() ?? Date.now()) - t0
  console.debug('[preloader:fetch] done', { url, elapsedMs: Math.round(dur) })
}

export function useImagePreloader() {
  const state = ref<PreloadState>('idle')
  const progress = ref(0) // 0..100
  const errors = ref<{ url: string; type: 'image' | 'json' | 'fetch'; err: string; critical: boolean }[]>([])
  const loaded = ref<number>(0)
  const total = ref<number>(0)
  console.info('[preloader] created')

  const loadedImages: Ref<string[]> = ref([])
  const failedImages: Ref<string[]> = ref([])

  let readyResolver: ((value: void | PromiseLike<void>) => void) | null = null
  let readyRejecter: ((reason?: unknown) => void) | null = null
  let readyPromise: Promise<void> | null = null
  let initStartedAt = 0

  function resetReadyPromise() {
    readyPromise = new Promise<void>((resolve, reject) => {
      readyResolver = resolve
      readyRejecter = reject
    })
    console.debug('[preloader] resetReadyPromise')
  }

  function updateProgress() {
    if (total.value === 0) {
      progress.value = 100
      console.debug('[preloader] progress', { loaded: loaded.value, total: total.value, pct: progress.value })
      return
    }
    const pct = Math.min(100, Math.round((loaded.value / total.value) * 100))
    progress.value = pct
    console.debug('[preloader] progress', { loaded: loaded.value, total: total.value, pct })
  }

  function markLoaded() {
    loaded.value += 1
    console.debug('[preloader] markLoaded', { loaded: loaded.value, total: total.value })
    updateProgress()
  }

  function markFailed(item: { url: string; type: 'image' | 'json' | 'fetch'; critical: boolean }, err: unknown) {
    const entry = { url: item.url, type: item.type, err: err instanceof Error ? err.message : String(err), critical: item.critical }
    errors.value.push(entry)
    console.warn('[preloader] markFailed', entry)
    if (item.type === 'image') {
      failedImages.value.push(item.url)
    }
    markLoaded()
  }

  async function initialize(manifest: PreloadManifest): Promise<void> {
    initStartedAt = performance.now?.() ?? Date.now()
    console.info('[preloader] initialize', {
      images: manifest.images?.length ?? 0,
      json: manifest.json?.length ?? 0,
      fetches: manifest.fetches?.length ?? 0,
    })
    state.value = 'loading'
    errors.value = []
    loaded.value = 0

    const imgList = manifest.images ?? []
    const jsonList = manifest.json ?? []
    const fetchList = manifest.fetches ?? []

    total.value = imgList.length + jsonList.length + fetchList.length
    updateProgress()
    resetReadyPromise()
    console.debug('[preloader] totals', { total: total.value })

    const tasks: Promise<void>[] = []

    // Images
    for (const img of imgList) {
      const task = withTimeout(loadAndDecodeImage(img.url).then(() => {
        loadedImages.value.push(img.url)
        markLoaded()
      }).catch((e) => {
        markFailed({ url: img.url, type: 'image', critical: !!img.critical }, e)
      }), img.timeoutMs ?? 10000, `image ${img.url}`)
      tasks.push(task)
    }

    // JSON (e.g., Lottie)
    for (const j of jsonList) {
      const task = withTimeout(fetchJson(j.url).then(() => {
        markLoaded()
      }).catch((e) => {
        markFailed({ url: j.url, type: 'json', critical: !!j.critical }, e)
      }), j.timeoutMs ?? 10000, `json ${j.url}`)
      tasks.push(task)
    }

    // Generic fetch warmups
    for (const f of fetchList) {
      const task = withTimeout(warmFetch(f.url, f.requestInit).then(() => {
        markLoaded()
      }).catch((e) => {
        markFailed({ url: f.url, type: 'fetch', critical: !!f.critical }, e)
      }), f.timeoutMs ?? 8000, `fetch ${f.url}`)
      tasks.push(task)
    }

    try {
      await Promise.all(tasks)
      const elapsedMs = Math.round((performance.now?.() ?? Date.now()) - initStartedAt)
      // If any critical failed, surface error
      const hasCriticalFailure = errors.value.some((e) => e.critical)
      if (hasCriticalFailure) {
        state.value = 'error'
        console.error('[preloader] ready=error (critical failures)', { errors: errors.value, elapsedMs })
        readyRejecter?.(new Error('Critical preload failure'))
      } else {
        state.value = 'ready'
        console.info('[preloader] ready', { loaded: loaded.value, total: total.value, elapsedMs })
        readyResolver?.()
      }
    } catch (e) {
      state.value = 'error'
      console.error('[preloader] initialize-caught', { error: e instanceof Error ? e.message : String(e) })
      readyRejecter?.(e)
    }
  }

  async function waitForReady(): Promise<void> {
    if (state.value === 'ready') {
      console.debug('[preloader] waitForReady already ready')
      return
    }
    if (!readyPromise) {
      console.debug('[preloader] waitForReady creating promise')
      resetReadyPromise()
    }
    return readyPromise as Promise<void>
  }

  const imagesLoaded = computed(() => state.value === 'ready' && (failedImages.value.length === 0 || !errors.value.some(e => e.type === 'image' && e.critical)))

  return {
    // State
    state,
    progress,
    errors,
    loaded,
    total,
    // Compatibility with previous API
    imagesLoaded,
    loadedImages,
    failedImages,
    // Controls
    initialize,
    waitForReady,
  }
}
