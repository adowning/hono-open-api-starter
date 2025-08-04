<script setup lang="ts">
import { onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'

/**
 * Initialize Embla with autoplay.
 * loop: false to avoid infinite loop edge-cases with scaling tween.
 * Autoplay plugin delay is 5000ms.
 */
const [emblaRef, emblaApi] = emblaCarouselVue(
  { loop: false },
  [Autoplay({ delay: 5000 })]
)

const TWEEN_FACTOR_BASE = 0.52
let tweenFactor = 0
let tweenNodes: HTMLElement[] = []

/**
 * Use VueUse to get reactive window height.
 * We show the carousel only when height > 700 (as per template condition).
 */
const { height } = useWindowSize()

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max)

function setTweenNodes(api: any) {
  if (!api) return
  tweenNodes = api.slideNodes().map((slideNode: HTMLElement) => slideNode)
}

function setTweenFactor(api: any) {
  if (!api) return
  tweenFactor = TWEEN_FACTOR_BASE * api.scrollSnapList().length
}

function tweenScale(api: any, eventName?: string) {
  if (!api) return
  const engine = api.internalEngine()
  const scrollProgress = api.scrollProgress()
  const slidesInView: number[] = api.slidesInView()
  const isScrollEvent = eventName === 'scroll'

  api.scrollSnapList().forEach((scrollSnap: number, snapIndex: number) => {
    let diffToTarget = scrollSnap - scrollProgress
    const slidesInSnap: number[] = engine.slideRegistry[snapIndex]

    slidesInSnap.forEach((slideIndex: number) => {
      if (isScrollEvent && !slidesInView.includes(slideIndex)) return

      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((loopItem: any) => {
          const target = loopItem.target()
          if (slideIndex === loopItem.index && target !== 0) {
            const sign = Math.sign(target)
            if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
            if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
          }
        })
      }

      const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor)
      const scale = numberWithinRange(tweenValue, 0, 1).toString()
      const tweenNode = tweenNodes[slideIndex]
      if (tweenNode) tweenNode.style.transform = `scale(${scale})`
    })
  })
}

function setupTweenScale(apiRef: { value: any }) {
  if (!apiRef?.value) return
  setTweenNodes(apiRef.value)
  setTweenFactor(apiRef.value)
  tweenScale(apiRef.value)

  apiRef.value
    .on('reInit', setTweenNodes)
    .on('reInit', setTweenFactor)
    .on('reInit', tweenScale)
    .on('scroll', tweenScale)
    .on('slideFocus', tweenScale)

  return () => {
    tweenNodes.forEach((slide) => slide.removeAttribute('style'))
  }
}

onMounted(() => {
  setupTweenScale(emblaApi)
})
</script>

<template>
  <div
    style="width: 100vw; max-width: 600px; height: 22vh"
    class="justify-start items-start flex grow-0"
  >
    <div v-if="height > 700" id="AdCarousel" class="adcarousel max-w-[700px]">
      <div ref="emblaRef" class="embla">
        <div
          class="embla__container justify-center items-center flex h-[100%] m-auto max-w-[500px]"
        >
          <div class="embla__slide">
            <img src="/images/ads/casinoadfreechips.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoadfreechips.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoadfreechips.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .adcarousel {
    position: relative; /* establish stacking context */
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Keep enough room for the dock */
    min-height: 220px;
    overflow: hidden;
  }

  /* Render the dock as a persistent background layer via ::before
     so it does not get overwritten by slide-level inline styles or repaint */
  .adcarousel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/images/ads/promo-dock.png');
    background-repeat: no-repeat;
    background-position: center bottom;
    background-size: 90% auto;
    pointer-events: none;
    z-index: 0;
  }

  .embla {
    position: relative;
    z-index: 1; /* ensure slides render above the dock layer */
    overflow: hidden;
    height: 100%;
    align-items: start;
    justify-content: center;
    width: 100%;
    margin: auto;
  }

  .embla__container {
    display: flex;
    width: 100%;
    align-items: start;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
        width: 80%;
    margin: auto;
    padding-bottom: 0px;
    padding-left: 26px;
    padding-right: 26px;
    position: relative;
    z-index: 1;
  }
</style>
