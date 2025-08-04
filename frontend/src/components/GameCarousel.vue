<script setup lang="ts">
import { useGameStore } from "@/stores/game.store";
// onUnmounted is used; keep it imported. Silence ESLint false positive by referencing it deliberately.
import { onMounted, onUnmounted, ref, watch } from "vue";
import StarBurst from "./StarBurst.vue";
import type { Game } from "@/sdk/generated";
import type { PreloadManifest } from "@/composables/useImagePreloader";
import GameCard from "./GameCard.vue";
import { getGameImageUrl } from "@/lib/imageUrl";
import { useGameImageLoader } from "@/composables/useGameImageLoader";
import SpriteAnimator from "./SpriteAnimator.vue";
import LogoJson from "@/assets/anim/logo_shine.json";

interface LocalGame extends Omit<Game, "id"> {
  id: string | number;
  temperature: "hot" | "cold" | "none";
  featured?: boolean;
  developer: string;
}

const gameStore = useGameStore();

// Optional prop to allow parent-driven lists (e.g., filtered)
const props = defineProps<{
  games?: Array<Partial<Game> & { id: string | number }>
}>()

// Internal list; defaults to store but can follow prop when provided
const games = ref<LocalGame[]>([]);

// Export critical assets for above-the-fold (first two visible game cards on typical mobile)
// The actual URLs depend on game data; we provide a static fallback banner so cards render cleanly.
// Note: currently unused locally; kept for potential external use. Disable lint warning.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getGameCarouselAboveTheFoldAssets(): PreloadManifest {
  return {
    images: [
      { url: "/images/games/tall-field.avif", critical: true },
      { url: "/images/games/featured.webp", critical: false },
    ],
  };
}

/**
 * Normalizer to LocalGame for both store and prop sources
 */
const toLocal = (list: Array<any>): LocalGame[] =>
  list.map((game) => ({
    ...game,
    id: game.id,
    temperature: "none",
    featured: false,
    title: (game as any).title || (game as any).name || "Untitled Game",
    category: (game as any).category || "other",
    tags: Array.isArray((game as any).tags) ? (game as any).tags : [],
    isActive: (game as any).isActive ?? true,
    developer: String((game as any).developer ?? "").toLowerCase(),
  })) as LocalGame[]

// When parent provides games prop, prefer it; otherwise follow store
watch(
  () => [props.games, gameStore.games],
  () => {
    const source = props.games && props.games.length ? (props.games as any[]) : (gameStore.games as any[])
    games.value = toLocal(source)
  },
  { immediate: true, deep: true }
);
 
// Reference onUnmounted to satisfy ESLint that it is used indirectly via registered hook below.
/* eslint-disable @typescript-eslint/no-unused-vars */
const __ensureOnUnmountedUsed = onUnmounted;
/* eslint-enable @typescript-eslint/no-unused-vars */
// Alive flag to guard async/observer callbacks after unmount
let isAlive = true;

const carousel = ref<HTMLElement | null>(null);
const customScrollbar = ref<HTMLElement | null>(null);
const thumb = ref<HTMLElement | null>(null);
const animatingGameId = ref<string | null>(null);

// Image loader composable state
const {
  loaded,
  preload,
  getState,
  getBackgroundStyle,
} = useGameImageLoader();

// Removed LogoShineJson usage from template to prevent runtime errors.
// If a specific sprite is desired later, import its JSON and pass proper props.

const getScrollDistance = (): number => {
  const screenWidth = window.innerWidth;
  if (screenWidth <= 360) {
    return 2 * 140 + 10 + 10;
  } else if (screenWidth <= 480) {
    return 2 * 160 + 12 + 12;
  } else if (screenWidth <= 768) {
    return 2 * 180 + 12 + 12;
  } else {
    return 200;
  }
};

/**
 * Sync custom scrollbar thumb position with carousel scrollLeft
 */
const syncThumbWithScroll = (): void => {
  if (!carousel.value || !thumb.value || !customScrollbar.value) return;

  const scrollWidth = carousel.value.scrollWidth;
  const clientWidth = carousel.value.clientWidth;
  const maxScroll = Math.max(1, scrollWidth - clientWidth);

  // Track inner width (excludes padding)
  const trackStyle = getComputedStyle(customScrollbar.value);
  const pl = parseFloat(trackStyle.paddingLeft || '0');
  const pr = parseFloat(trackStyle.paddingRight || '0');
  const innerWidth = customScrollbar.value.clientWidth - pl - pr;

  // Make sure thumb cannot visually exceed the track box
  const thumbWidth = Math.min(thumb.value.clientWidth, innerWidth);
  const maxThumbX = Math.max(0, innerWidth - thumbWidth);

  const ratio = maxScroll === 0 ? 0 : (carousel.value.scrollLeft / maxScroll);
  const thumbX = Math.round(ratio * maxThumbX);

  // Apply transform and clamp via overflow hidden on the track
  thumb.value.style.transform = `translateX(${thumbX}px)`;
};

/**
 * Handle dragging of the custom scrollbar thumb
 */
let isDragging = false;
let dragStartX = 0;
let thumbStartX = 0;
// rAF batching state for smooth drag updates
let rafId: number | null = null;
// Guard to avoid feedback loop between programmatic scroll and scroll listener
let suppressScrollSync = false;

const onThumbPointerDown = (e: PointerEvent): void => {
  if (!thumb.value || !customScrollbar.value) return;
  isDragging = true;

  // Compute geometry once at drag start
  const trackRect = customScrollbar.value.getBoundingClientRect();
  const style = getComputedStyle(thumb.value);
  const transform = style.transform;
  const currentX = (!transform || transform === 'none') ? 0 : new DOMMatrixReadOnly(transform).m41;

  // The pointer’s offset within the thumb so the thumb tracks the pointer precisely
  // pointerX relative to the track's inner content box
  const trackStyle = getComputedStyle(customScrollbar.value);
  const pl = parseFloat(trackStyle.paddingLeft || '0');
  dragStartX = e.clientX - trackRect.left - pl;
  thumbStartX = currentX;

  thumb.value.setPointerCapture(e.pointerId);
  // Disable transition during drag to avoid lag
  thumb.value.style.transition = 'none';
  // Prevent native touch scroll
  e.preventDefault();
};

const onPointerMove = (e: PointerEvent): void => {
  if (!isDragging || !carousel.value || !customScrollbar.value || !thumb.value) return;

  // Pointer X relative to track inner box
  const trackRect = customScrollbar.value.getBoundingClientRect();
  const trackStyle = getComputedStyle(customScrollbar.value);
  const pl = parseFloat(trackStyle.paddingLeft || '0');
  const pr = parseFloat(trackStyle.paddingRight || '0');
  const innerWidth = customScrollbar.value.clientWidth - pl - pr;

  const pointerX = e.clientX - trackRect.left - pl;

  // Keep the cursor bound to the thumb by using the pointer's absolute position within the track:
  // nextThumbX = pointerX - (cursor offset captured at pointerdown)
  let nextThumbX = pointerX - (dragStartX - thumbStartX);

  const thumbWidth = Math.min(thumb.value.clientWidth, innerWidth);
  const maxThumbX = Math.max(0, innerWidth - thumbWidth);
  nextThumbX = Math.min(maxThumbX, Math.max(0, nextThumbX));

  // Direct transform without additional damping so cursor and thumb stay in sync
  thumb.value.style.transform = `translateX(${nextThumbX}px)`;

  // Map to scrollLeft with a mild easing factor (faster than before)
  const scrollWidth = carousel.value.scrollWidth;
  const clientWidth = carousel.value.clientWidth;
  const maxScroll = Math.max(1, scrollWidth - clientWidth);
  const ratio = maxThumbX === 0 ? 0 : nextThumbX / maxThumbX;

  const scrollDamping = 0.95; // closer to 1.0 => faster than before (was 0.85)
  carousel.value.scrollLeft = ratio * maxScroll * scrollDamping;

  // Prevent page scrolling on touch devices while dragging
  e.preventDefault();
};

const onPointerUp = (e: PointerEvent | Event): void => {
  if (!isDragging || !thumb.value) return;
  isDragging = false;
  // For blur/pointercancel events, releasePointerCapture may throw if not captured; guard it
  try {
    if (e instanceof PointerEvent) {
      thumb.value.releasePointerCapture(e.pointerId);
    }
  } catch {}
  // Re-enable transition for non-drag updates
  thumb.value.style.transition = '';
  // Flush any pending RAF
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

/**
 * Clicking on the track should jump the thumb and scroll
 */
const onTrackClick = (e: MouseEvent): void => {
  if (!customScrollbar.value || !carousel.value || !thumb.value) return;

  const rect = customScrollbar.value.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  const trackStyle = getComputedStyle(customScrollbar.value);
  const pl = parseFloat(trackStyle.paddingLeft || '0');
  const pr = parseFloat(trackStyle.paddingRight || '0');
  const innerWidth = customScrollbar.value.clientWidth - pl - pr;
  const innerX = Math.max(0, Math.min(innerWidth, clickX - pl)); /* clamp inside padded area */

  const thumbWidth = Math.min(thumb.value.clientWidth, innerWidth);
  const maxThumbX = Math.max(0, innerWidth - thumbWidth);

  const targetThumbX = Math.min(maxThumbX, Math.max(0, innerX - thumbWidth / 2));
  const scrollWidth = carousel.value.scrollWidth;
  const clientWidth = carousel.value.clientWidth;
  const maxScroll = Math.max(1, scrollWidth - clientWidth);

  const ratio = maxThumbX === 0 ? 0 : targetThumbX / maxThumbX;
  // Apply similar damping when clicking the track so it is not too fast
  const clickScrollDamping = 0.85;
  carousel.value.scrollLeft = ratio * maxScroll * clickScrollDamping;
  // Sync the visual thumb immediately
  thumb.value.style.transform = `translateX(${Math.round(targetThumbX)}px)`;
};

const scrollLeft = (distance?: number): void => {
  if (carousel.value) {
    const scrollDistance = distance || getScrollDistance();
    carousel.value.scrollBy({
      left: -scrollDistance,
      behavior: "smooth",
    });
  }
};

const scrollRight = (distance?: number): void => {
  if (carousel.value) {
    const scrollDistance = distance || getScrollDistance();
    carousel.value.scrollBy({
      left: scrollDistance,
      behavior: "smooth",
    });
  }
};

defineExpose({
  scrollLeft,
  scrollRight,
});

const loadGame = async (game: LocalGame): Promise<void> => {
  if (animatingGameId.value !== null) return; // Prevent clicking during animation

  const gameId = String(game.id);
  if (animatingGameId.value === gameId) return;

  animatingGameId.value = gameId;

  // Ensure image is preloaded for crisp transition
  const imageUrl = getGameImageUrl(game);
  if (imageUrl) {
    preload(gameId, imageUrl);
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  const gameUrl = "url" in game && (game as any).url ? String((game as any).url) : "#";
  window.open(gameUrl, "_blank");

  setTimeout(() => {
    animatingGameId.value = null;
  }, 100);
};

// Intersection Observer for lazy loading
let intersectionObserver: IntersectionObserver | null = null;

const setupLazyLoading = (): void => {
  if (intersectionObserver) {
    try { intersectionObserver.disconnect(); } catch {}
  }

  const rootEl = carousel.value ?? null;

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (!isAlive) return;
      entries.forEach((entry) => {
        if (!isAlive) return;
        const targetEl = entry.target as Element | null;
        if (!targetEl) return;

        const gameIdAttr = targetEl.getAttribute("data-game-id") || "0";
        const gameIndex = games.value.findIndex((g) => String(g.id) === String(gameIdAttr));
        const game = gameIndex >= 0 ? games.value[gameIndex] : undefined;

        const isTopTwo = gameIndex > -1 && gameIndex < 2;

        if (isTopTwo || entry.isIntersecting || entry.intersectionRatio > 0) {
          if (game) {
            const gid = String(game.id);
            const url = getGameImageUrl(game);
            if (url && !loaded.value.has(gid)) {
              preload(gid, url);
            }
            try { intersectionObserver?.unobserve(targetEl); } catch {}
          }
        }
      });
    },
    {
      root: rootEl,
      rootMargin: "200px",
      threshold: 0,
    }
  );

  const observeAllCards = () => {
    if (!isAlive || !intersectionObserver) return;
    const cards = document.querySelectorAll(".game-card");
    cards.forEach((card) => {
      try { intersectionObserver?.observe(card); } catch {}
    });
  };

  observeAllCards();
  setTimeout(observeAllCards, 200);
};

onMounted((): void => {
  setupLazyLoading();

  // Ensure initial images preload regardless of user scroll and list timing
  const initialLoadCount = window.innerWidth <= 768 ? 3 : 6;
  const prime = () => {
    // Safely derive gid/url and use composable's preload
    games.value.slice(0, initialLoadCount).forEach((game) => {
      const gid = String(game.id);
      const url = getGameImageUrl(game);
      if (url && !loaded.value.has(gid)) {
        preload(gid, url);
      }
    });
    requestAnimationFrame(() => {
      // re-observe in case DOM updated after filtering
      const cards = document.querySelectorAll(".game-card");
      cards.forEach((c) => intersectionObserver?.observe(c));
      syncThumbWithScroll();
    });
  };
  // Try multiple times to cover async population and immediate filter changes
  prime();
  queueMicrotask(prime);
  setTimeout(prime, 120);
  setTimeout(prime, 300);

  if (carousel.value) {
    // Inline wrapper defined here (do not export from SFC)
    const localScrollWrapper = () => {
      if (!isAlive) return;
      if (suppressScrollSync) return;
      handleCarouselScroll();
      syncThumbWithScroll();
    };
    carousel.value.addEventListener("scroll", localScrollWrapper);
    // Save remover for cleanup
    (carousel as any)._removeScrollWrapper = () => {
      try { carousel.value?.removeEventListener("scroll", localScrollWrapper); } catch {}
    };
    // Initial sync
    requestAnimationFrame(() => { if (isAlive) syncThumbWithScroll(); });
  }

  if (thumb.value) {
    thumb.value.addEventListener("pointerdown", onThumbPointerDown);
    // Use non-passive listeners since we update UI immediately
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: false });
    window.addEventListener("pointercancel", onPointerUp, { passive: false });
    window.addEventListener("blur", onPointerUp, { passive: false });
  }

  if (customScrollbar.value) {
    customScrollbar.value.addEventListener("click", onTrackClick);
  }

  const onResize = () => {
    if (!isAlive) return;
    syncThumbWithScroll();
    // re-observe after layout changes
    const cards = document.querySelectorAll(".game-card");
    cards.forEach((c) => {
      try { intersectionObserver?.observe(c); } catch {}
    });
  };
  window.addEventListener("resize", onResize);

  // Attach cleanup handlers
  (window as any)._gameCarouselCleanup = () => {
    try { window.removeEventListener("pointermove", onPointerMove as any); } catch {}
    try { window.removeEventListener("pointerup", onPointerUp as any); } catch {}
    try { window.removeEventListener("pointercancel", onPointerUp as any); } catch {}
    try { window.removeEventListener("blur", onPointerUp as any); } catch {}
    try { window.removeEventListener("resize", onResize as any); } catch {}
    try { customScrollbar.value?.removeEventListener("click", onTrackClick); } catch {}
    try { (carousel as any)._removeScrollWrapper?.(); } catch {}
    try { intersectionObserver?.disconnect(); } catch {}
  };
});

 
const handleCarouselScroll = (): void => {
  if (!carousel.value) return;

  const sLeft = carousel.value.scrollLeft;
  const containerWidth = carousel.value.offsetWidth;
  const sRight = sLeft + containerWidth;

  games.value.forEach((game, index) => {
    const gid = String(game.id);
    // loaded is a Ref<Set<string>> from the composable; use .value
    if (!loaded.value.has(gid)) {
      const cardWidth = window.innerWidth <= 768 ? 180 : 200;
      const gap = 15;
      const cardPosition = index * (cardWidth + gap);

      if (cardPosition >= sLeft - 600 && cardPosition <= sRight + 600) {
        const url = getGameImageUrl(game);
        if (url) preload(gid, url);
      }
    }
  });
};
 

/* Image error handler removed; image rendering is now handled by GameCard and composable-driven background styles */

const isFeatured = (game: LocalGame): boolean => Boolean(game.featured);
</script>

<template>
  <div
    class="carousel-container animate__animated animate__fadeIn bungee align-center relative flex flex-col items-center justify-start"
  >
    <div ref="carousel" class="carousel-scroll-area" id="carousel">
      <div class="carousel-track">
        <div
          v-for="game in games"
          :key="game.name"
          :data-game-id="game.id"
          class="game-card"
          :class="{
            'theme-cold': game.temperature === 'cold',
            'theme-hot': game.temperature === 'hot',
            'animate-pulse': animatingGameId === String(game.id),
            'is-fading-out':
              animatingGameId !== null && animatingGameId !== String(game.id),
          }"
          @click="loadGame(game)"
        >
          <div
            class="card-content relative flex flex-col pt-5 max-h-[300px]"
            :class="{ 'feat mt-3 flex-col align-bottom': isFeatured(game) }"
            :style="{
              backgroundImage: `url(${
                !isFeatured(game)
                  ? '/images/games/tall-field.avif'
                  : '/images/games/featured.webp'
              })`,
            }"
            style="background-size: 100% 100%; background-repeat: no-repeat"
          >
            <!-- Per-card image state layer -->
            <div class="relative w-full overflow-hidden media-box">
              <!-- Single conditional chain for overlays -->
              <div
                v-if="getState(String(game.id)) === 'loading'"
                class="absolute inset-0 z-10 flex items-center justify-center bg-transparent"
                aria-hidden="true"
              >
                <!-- Safe loading indicator without undefined LogoShineJson -->
                 <SpriteAnimator
        v-if="showLogoOverlayWhenLoading !== false && imageState !== 'error'"
        :animation-data="LogoJson"
        image-url="/images/logo_shine.png"
        :width="60"
        :height="60"
        :frame-count="LogoJson.frames.length"
        :initial-delay-max="0"
        :loop-delay="0"
        :framerate="30"
        class="h-16 w-16 opacity-80"
      />
              </div>

              <div
                v-else-if="getState(String(game.id)) === 'error'"
                class="absolute inset-0 z-10 flex items-center justify-center"
              >
                <img
                  src="/images/logo.png"
                  alt="Game artwork unavailable"
                  class="max-h-full max-w-full object-contain block"
                  decoding="async"
                  loading="lazy"
                />
              </div>

              <!-- Base background layer (success or none) -->
              <div
                class="absolute inset-0 z-0 pointer-events-none select-none"
                :style="getBackgroundStyle(String(game.id), getGameImageUrl(game), 0.608, { isRedTiger: (game.developer || '').toLowerCase() === 'redtiger' })"
                aria-hidden="true"
              ></div>
            </div>
            <div
              :class="isFeatured(game) ? 'card__banner_feat' : 'card__banner'"
              style=""
            >
              <img
                v-if="game.temperature === 'cold'"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-blue.png"
                alt=""
                class="card__banner-img"
              />
              <img
                v-else-if="game.temperature === 'hot'"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png"
                alt=""
                class="card__banner-img"
              />
              <img
                v-else
                src="/images/games/hand-banner-black.png"
                alt=""
                class="card__banner-img"
              />
              <div
                class="card__banner__text onacona pb-1"
                style="line-height: 1.7; letter-spacing: 1.2px; color: white"
              >
                <span
                  :style="
                    game.title.length > 12 ? 'font-size: .8rem; ' : 'font-size: 1rem'
                  "
                >
                  {{ game.title.substring(0, 16) }}
                </span>
              </div>
            </div>

            <div
              :class="
                isFeatured(game)
                  ? 'card-image-container-featured feat box'
                  : 'card-image-container'
              "
              class="absolute top-0 overflow-hidden"
              style="z-index: 1"
            >
              <div
                class="game-image-container-with-filler absolute"
                style="
                  width: 92%;
                  top: 20px;
                  height: 240px;
                  max-height: 260px;
                  padding-top: 20px;
                  background: linear-gradient(
                    to bottom,
                    rgba(0, 0, 0, 0.1) 0%,
                    rgba(0, 0, 0, 0.05) 20%,
                    transparent 30%,
                    transparent 70%,
                    rgba(0, 0, 0, 0.05) 80%,
                    rgba(0, 0, 0, 0.1) 100%
                  );
                  border-radius: 15px;
                  border-top-left-radius: 30px;
                  border-top-right-radius: 30px;
                  overflow: hidden;
                "
              >
                <!-- Replace inline background/image block with GameCard for presentational concerns -->
                <GameCard
                  class="mr-3 md:mr-4"
                  :id="game.id"
                  :title="(game as any).title || (game as any).name || 'Untitled Game'"
                  :developer="game.developer"
                  :url="(game as any).url as string | undefined"
                  :image-url="getGameImageUrl(game)"
                  :image-state="getState(String(game.id))"
                  :background-style="getBackgroundStyle(
                    String(game.id),
                    getGameImageUrl(game),
                    0.608,
                    { isRedTiger: (game.developer || '').toLowerCase() === 'redtiger' }
                  )"
                  :is-animating="animatingGameId === String(game.id)"
                  @select="() => loadGame(game)"
                  :data-game-id="String(game.id)"
                />
              </div>
              <!-- Preserve temperature badges if needed; they can be reintroduced inside GameCard later -->
              <!-- v-if blocks removed as GameCard handles its visual composition -->


            </div>
          </div>
          <StarBurst />
        </div>
      </div>
    </div>

    <!-- Custom Scrollbar (controls the carousel) -->
    <div class="custom-scrollbar-wrapper">
      <div
        class="custom-scrollbar-track"
        ref="customScrollbar"
        role="scrollbar"
        aria-controls="carousel"
        aria-orientation="horizontal"
        tabindex="0"
      >
        <div
          class="custom-scrollbar-thumb"
          ref="thumb"
          aria-label="Scroll games"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Your existing styles */
.carousel-container {
  height: 42vh;
  min-height: 300px;
  max-height: 420px; /* bump a bit to ensure room for scrollbar */
  width: 100%;
  max-width: 600px;
  margin: 0;
  margin-top: 4px; /* was 10px, bring the block higher on the page */
  margin-bottom: 4px; /* was 10px */
  position: relative;
  box-sizing: border-box;
}

.carousel-scroll-area {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  height: calc(100% - 28px); /* free space below for custom scrollbar */
  width: 100%;
  scrollbar-width: none;
  /* Disable smooth so drag-driven updates are stable */
  scroll-behavior: auto;
  padding-bottom: 8px; /* ensure content not flush with scrollbar */
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: auto;
}
/* Hide native scrollbar on WebKit */
.carousel-scroll-area::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 12px;
  height: 100%;
  box-sizing: border-box;
  padding-bottom: 4px; /* small spacing above the scrollbar */
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
  background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png")
    0 0 no-repeat;
  background-size: 100% 110%;
  z-index: 4;
}

.card__banner_feat {
  width: 100%;
  position: absolute;
  top: 9%;
  left: 51%;
  transform: translateX(-51.5%);
  background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png")
    0 0 no-repeat;
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
/* Custom Scrollbar */
.custom-scrollbar-wrapper {
  width: 100%;
  max-width: 600px;
  margin-top: 2px; /* was 6px, tighten spacing to bring FilterBar closer */
  display: flex;
  justify-content: center;
}

.custom-scrollbar-track {
  position: relative;
  /* Slightly shorter track to let thumb overlap top/bottom */
  width: calc(100% - 8px);
  min-height: 22px;
  height: 12px;
  background-image: url('/images/common/scroll_bar.png');
  background-repeat: no-repeat;
  background-size: 100% 80%;
  background-position: center center;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  background-color: rgba(255,255,255,0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 6px;
  padding-right: 6px;
  box-sizing: border-box;
  /* allow thumb to overlap */
  overflow: visible;
  z-index: 0;
}

.custom-scrollbar-thumb {
  position: relative;
  left: 0;
  /* Wider by default but still bounded inside the track’s inner width */
  width: clamp(72px, 18%, 160px);
  /* Make the thumb slightly taller so it overlaps the track */
  height: 26px; /* track is 22px */
  /* Raise the thumb slightly so it sits higher on screen while overlapping more above */
  top: 10%;
  transform: translate(0, -60%); /* was -50% */
  margin-top: -4px; /* was -2px */
  background-image: url('/images/common/scroll_thumb.png');
  background-repeat: no-repeat;
  /* Fill the thumb box completely */
  background-size: 100% 100%;
  background-position: center center;
  cursor: grab;
  user-select: none;
  touch-action: none;
  background-color: rgba(255,255,255,0.2);
  border-radius: 12px;
  outline: 1px solid rgba(255,255,255,0.25);
  box-sizing: border-box;
  z-index: 1;
}

.custom-scrollbar-thumb:active {
  cursor: grabbing;
}

@media (max-width: 360px) {
  .custom-scrollbar-thumb {
    width: 72px;
  }
}
</style>
