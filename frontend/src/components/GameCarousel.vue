<script setup lang="ts">
import { useGameStore } from '@/stores/game.store'
import { onMounted, ref, watch } from 'vue'
import StarBurst from './StarBurst.vue';
import type { Game } from '@/sdk/generated'

interface LocalGame extends Omit<Game, 'id'> {
  id: string | number
  temperature: 'hot' | 'cold' | 'none'
  featured?: boolean
  developer: string
  provider?: string
}

const gameStore = useGameStore()
const games = ref<LocalGame[]>([])

// Update games when gameStore.games changes
watch(() => gameStore.games, (newGames) => {
  games.value = newGames.map((game): LocalGame => ({
    ...game,
    id: game.id,
    temperature: 'none',
    featured: false,
    developer: 'provider' in game ? String(game.provider) : 'unknown',
    title: game.title || game.name || 'Untitled Game',
    category: game.category || 'other',
    tags: Array.isArray(game.tags) ? game.tags : [],
    isActive: game.isActive ?? true
  }))
}, { immediate: true })
const carousel = ref<HTMLElement | null>(null)
const animatingGameId = ref<string | null>(null);

// Lazy loading state
const loadedImages = ref<Set<string>>(new Set())
const imageLoadingStates = ref<Map<string, 'loading' | 'loaded' | 'error'>>(new Map())
const imageDimensions = ref<Map<string, { width: number; height: number; aspectRatio: number }>>(new Map())
// Get image URL for a game
const getGameImageUrl = (game: LocalGame): string => {
  // console.log(game)
  const developer = game.providerName?.toLowerCase() || ''
  const gameName = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  // return `/images/games/${developer}/${gameName}.avif`

  return `https://images.cashflowcasino.com/${developer}/${gameName}.avif`

}

// Get smart background sizing based on image aspect ratio
const getSmartBackgroundSize = (game: LocalGame) => {
  const gameId = String(game.id)
  const dimensions = imageDimensions.value.get(gameId)
  if (!dimensions) return 'auto 100%' // Default fallback

  const { aspectRatio } = dimensions
  // Mobile container aspect ratio: 145.19/239 = 0.608
  const containerAspectRatio = 0.608

  // Special handling for Red Tiger images (rtg.avif)
  const isRedTiger = game.developer.toLowerCase() === 'redtiger' || getGameImageUrl(game).includes('rtg.avif')

  if (isRedTiger) {
    // Red Tiger games often have logos at the top, so we show more of the bottom
    return aspectRatio > containerAspectRatio ? 'auto 100%' : '100% auto'
  }

  // For other games, use a more balanced approach
  return aspectRatio > containerAspectRatio ? 'auto 100%' : '100% auto'
}

// Get background image style with lazy loading and smart sizing
const getBackgroundImageStyle = (game: LocalGame) => {
  const gameId = String(game.id)
  const isLoaded = loadedImages.value.has(gameId)
  const loadingState = imageLoadingStates.value.get(gameId)

  return {
    backgroundImage: isLoaded ? `url(${getGameImageUrl(game)})` : 'none',
    backgroundSize: getSmartBackgroundSize(game),
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: isLoaded && loadingState === 'loaded' ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  }
}

// Preload image and update state
const preloadImage = (game: LocalGame): void => {
  const gameId = String(game.id)
  if (loadedImages.value.has(gameId)) {
    return
  }

  const img = new Image()
  const imageUrl = getGameImageUrl(game)

  if (!imageUrl) {
    console.error('No image URL found for game:', game.id)
    return
  }

  imageLoadingStates.value.set(gameId, 'loading')

  img.onload = (): void => {
    loadedImages.value.add(gameId)
    imageLoadingStates.value.set(gameId, 'loaded')
    imageDimensions.value.set(gameId, {
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight
    })
  }

  img.onerror = (): void => {
    console.error(`Failed to load image: ${imageUrl}`)
    imageLoadingStates.value.set(gameId, 'error')
  }

  img.src = imageUrl
}

const getScrollDistance = () => {
  const screenWidth = window.innerWidth
  if (screenWidth <= 360) {
    return 2 * 140 + 10 + 10
  } else if (screenWidth <= 480) {
    return 2 * 160 + 12 + 12
  } else if (screenWidth <= 768) {
    return 2 * 180 + 12 + 12
  } else {
    return 200
  }
}

const scrollLeft = (distance?: number) => {
  if (carousel.value) {
    const scrollDistance = distance || getScrollDistance()
    carousel.value.scrollBy({
      left: -scrollDistance,
      behavior: 'smooth'
    })
  }
}

const scrollRight = (distance?: number) => {
  if (carousel.value) {
    const scrollDistance = distance || getScrollDistance()
    carousel.value.scrollBy({
      left: scrollDistance,
      behavior: 'smooth'
    })
  }
}

defineExpose({
  scrollLeft,
  scrollRight
})

const loadGame = async (game: LocalGame) => {
  if (animatingGameId.value !== null) return; // Prevent clicking during animation

  const gameId = String(game.id)
  if (animatingGameId.value === gameId) return

  animatingGameId.value = gameId
  preloadImage(game)

  // Use a promise to properly handle the async operation
  await new Promise(resolve => setTimeout(resolve, 100))

  const gameUrl = 'url' in game && game.url ? String(game.url) : '#'
  window.open(gameUrl, '_blank')

  setTimeout(() => {
    animatingGameId.value = null
  }, 100)
}

// Intersection Observer for lazy loading
let intersectionObserver: IntersectionObserver | null = null

const setupLazyLoading = () => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const gameId = parseInt(entry.target.getAttribute('data-game-id') || '0')
          const game = games.value.find((g) => String(g.id) === String(gameId))
          if (game && !loadedImages.value.has(String(game.id))) {
            preloadImage(game)
            intersectionObserver?.unobserve(entry.target)
          }
        }
      })
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  setTimeout(() => {
    const gameCards = document.querySelectorAll('.game-card')
    gameCards.forEach((card) => {
      if (intersectionObserver) {
        intersectionObserver.observe(card)
      }
    })
  }, 100)
}

onMounted(() => {
  setupLazyLoading()
  const initialLoadCount = window.innerWidth <= 768 ? 2 : 4
  games.value.slice(0, initialLoadCount).forEach((game) => {
    preloadImage(game)

    if (carousel.value) {
      carousel.value.addEventListener('scroll', handleCarouselScroll)
    }
  })
})

const handleCarouselScroll = () => {
  if (!carousel.value) return

  const scrollLeft = carousel.value.scrollLeft
  const containerWidth = carousel.value.offsetWidth
  const scrollRight = scrollLeft + containerWidth

  games.value.forEach((game, index) => {
    if (!loadedImages.value.has(String(game.id))) {
      const cardWidth = window.innerWidth <= 768 ? 180 : 200
      const gap = window.innerWidth <= 768 ? 15 : 15
      const cardPosition = index * (cardWidth + gap)

      if (cardPosition >= scrollLeft - 400 && cardPosition <= scrollRight + 400) {
        preloadImage(game)
      }
    }
  })
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://placehold.co/300x400/64748b/ffffff?text=Image+Error'
  target.style.objectFit = 'contain'
}

const isFeatured = (game: LocalGame): boolean => Boolean(game.featured)
</script>

<template>
  <div class="carousel-container bungee align-center relative flex flex-row items-center justify-center">
    <div ref="carousel" class="carousel-scroll-area">
      <div class="carousel-track">
        <div v-for="game in games" :key="game.name" :data-game-id="game.id" class="game-card" :class="{
          'theme-cold': game.temperature === 'cold',
          'theme-hot': game.temperature === 'hot',
          'animate-pulse': animatingGameId === String(game.id),
          'is-fading-out': animatingGameId !== null && animatingGameId !== String(game.id)
        }" @click="loadGame(game)">
          <div class="card-content relative flex flex-col pt-5 max-h-[300px]"
            :class="{ 'feat mt-3 flex-col align-bottom': isFeatured(game) }" :style="{
              backgroundImage: `url(${!isFeatured(game) ? '/images/games/tall-field.avif' : '/images/games/featured.webp'})`
            }" style="background-size: 100% 100%; background-repeat: no-repeat">
            <div :class="isFeatured(game) ? 'card__banner_feat' : 'card__banner'" style="">
              <img v-if="game.temperature === 'cold'"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-blue.png" alt=""
                class="card__banner-img" />
              <img v-else-if="game.temperature === 'hot'"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png" alt=""
                class="card__banner-img" />
              <img v-else src="/images/games/hand-banner-black.png" alt="" class="card__banner-img" />
              <div class="card__banner__text onacona pb-1"
                style="line-height: 1.7; letter-spacing: 1.2px; color: white">
                <span :style="game.title.length > 12 ? 'font-size: .8rem; ' : 'font-size: 1rem'">
                  {{ game.title.substring(0, 16) }}
                </span>
              </div>
            </div>

            <div :class="isFeatured(game) ? 'card-image-container-featured feat box' : 'card-image-container'"
              class="absolute top-0 overflow-hidden" style="z-index: 1">
              <div class="game-image-container-with-filler absolute" style="
                  width: 92%;
                  top: 20px;
                  height: 240px;
                  max-height: 260px;
                  padding-top: 20px;
                  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 20%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.05) 80%, rgba(0, 0, 0, 0.1) 100%);
                  border-radius: 15px;
                  border-top-left-radius: 30px;
                  border-top-right-radius: 30px;
                  overflow: hidden;
                ">
                <div style="
                    width: 100%;
                    height: 100%;
                    background-position: center center;
                    background-repeat: no-repeat;
                    transition:
                      background-image 0.3s ease,
                      background-size 0.3s ease;
                  " :style="getBackgroundImageStyle(game)" :alt="game.title" class="game-image absolute"
                  @error="onImageError" />
              </div>
              <img v-if="game.temperature === 'cold'" src="/images/games/speedRTP_1.gif" height="40px" width="40px"
                style="position: absolute; bottom: 0; left: 0" />

              <img v-if="game.temperature === 'hot'" src="/images/games/speedRTP_5.gif" height="40px" width="40px"
                style="position: absolute; bottom: 0; left: 0" />

              <div class="bottom-banner">
                {{ game.developer }}
              </div>
            </div>
          </div>
          <StarBurst />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Your existing styles */
.carousel-container {
  height: 42vh;
  min-height: 300px;
  max-height: 380px;
  width: 100%;
  max-width: 600px;
  margin: 0 0;
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
  box-sizing: border-box;
}

.carousel-scroll-area {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  width: 100%;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.carousel-track {
  display: flex;
  gap: 12px;
  height: 100%;
  box-sizing: border-box;
}

.card-image-container {
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  border-radius: inherit;
  top: 0;
  z-index: 1;
}

.card-image-container-featured {
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  border-radius: inherit;
  top: 20px;
  z-index: 1;
}

.game-image-container-with-filler {
  z-index: 0;
  display: block;
  margin-left: 8px;
  margin-right: 5px;
  border-color: white;
  border-width: 1.5px;
  border-left-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-top-style: none;
  transition: transform 0.3s ease;
  position: absolute;
}

.game-image {
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: cover;
  transition: background-image 0.3s ease;
  position: absolute;
}

.game-card {
  flex-shrink: 0;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  max-height: 330px;
  height: 100%;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.game-card.is-selected {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 1000;
  transition: transform 0.5s ease-in-out, top 0.5s ease-in-out, left 0.5s ease-in-out;
}

.game-card.is-fading-out {
  opacity: 0;
  transform: scale(0.8);
}

.card__banner {
  width: 100%;
  position: absolute;
  top: 5%;
  left: 51%;
  transform: translateX(-51.5%) scaleY(1.1);
  background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png') 0 0 no-repeat;
  background-size: 100% 110%;
  z-index: 4;
}

.card__banner_feat {
  width: 100%;
  position: absolute;
  top: 9%;
  left: 51%;
  transform: translateX(-51.5%);
  background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png') 0 0 no-repeat;
  background-size: 100% auto;
  z-index: 4;
}

.card__banner-img {
  display: block;
  width: 100%;
  height: auto;
}

.card__banner__text {
  width: 90%;
  position: absolute;
  flex-wrap: nowrap;
  top: -2px;
  font-weight: 800;
  left: 50%;
  padding-left: 7px;
  padding-right: 7px;
  transform: translate(-51%, 10%);
  z-index: 5;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
}

.card-content {
  z-index: 2;
  width: 100%;
  height: 100%;
  max-height: 350px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: inherit;
  top: 0;
}

.bottom-banner {
  position: absolute;
  left: 0;
  width: 100%;
  background-color: transparent;
  color: white;
  text-align: center;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 8px 8px;
  text-transform: uppercase;
  z-index: 3;
  box-sizing: border-box;
  bottom: 0;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
</style>