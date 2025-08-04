<script setup lang="ts">
import { computed } from "vue";
import SpriteAnimator from "./SpriteAnimator.vue";
import LogoJson from "@/assets/anim/logo_shine.json";

type ImageState = "loading" | "loaded" | "error";

const props = defineProps<{
  id: string | number;
  title: string;
  developer: string;
  url?: string;
  imageUrl: string;
  imageState: ImageState | undefined;
  backgroundStyle: Record<string, string | number>;
  isAnimating?: boolean;
  showLogoOverlayWhenLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", payload: { id: string | number; url?: string }): void;
}>();

/**
 * Accessible label for the game card, favors title then developer.
 */
const a11yLabel = computed(() => {
  const t = (props.title || "").toString();
  const d = (props.developer || "").toString();
  return t ? `Open ${t}` : d ? `Open ${d} game` : "Open game";
});

const isBusy = computed(
  () => props.isAnimating === true || props.imageState === "loading"
);

function onSelect(): void {
  emit("select", { id: props.id, url: props.url });
}
</script>

<template>
  <button
    type="button"
    class="game-card group relative flex h-[145px] w-[239px] shrink-0 select-none overflow-hidden rounded-xl bg-neutral-900/40 ring-1 ring-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:h-[180px] md:w-[300px]"
    :aria-label="a11yLabel"
    :aria-busy="isBusy ? 'true' : 'false'"
    @click="onSelect"
  >
    <!-- Background layer (image applied via style binding) -->
    <div
      class="absolute inset-0"
      :style="backgroundStyle"
      role="img"
      :aria-label="title"
    ></div>

    <!-- Loading/error overlay -->
    <div
      class="absolute inset-0 grid place-items-center"
      v-if="imageState !== 'loaded'"
      aria-hidden="true"
    >
      <!-- Loading animation -->
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
      <!-- Fallback simple logo image if error -->
      <div v-else class="text-center">
        <img
          src="/images/logo.png"
          alt="Game artwork unavailable"
          class="mx-auto h-16 w-16 opacity-80"
          decoding="async"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Bottom gradient and title -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3"
      aria-hidden="true"
    >
      <!-- <div class="flex items-center justify-between gap-2">
        <span class="line-clamp-1 text-left text-sm font-medium text-white drop-shadow">
          {{ title }}
        </span>
        <span
          class="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80"
        >
          {{ developer }}
        </span>
      </div> -->
    </div>

    <!-- Hover/press glow -->
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
      aria-hidden="true"
      style="
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15),
          0 10px 25px rgba(0, 0, 0, 0.35);
      "
    />
  </button>
</template>
