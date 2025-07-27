<template>
  <footer class="bg-transparent  text-white pb-4 text-sm leading-3 tracking-tighter px-2 w-full bottom-0 flex justify-between h-[50px] left-0 items-end
    " :class="isMobile ? 'fixed' : 'absolute'"
    style=" background-image: url('/images/bottom/slice.avif'); background-size: contain;background-position-y: 100%;  background-repeat: repeat-x;">
    <div class=" flex flex-col onacona tracking-[-.1em]  text-[18px] leading-2.5  items-center text-white">
      <SpriteAnimator :animation-data="WheelAnimation" :image-url="wheelImageUrl" :width="78" :height="50"
        :frame-count="WheelAnimation.frames.length" :frame-rate="10" />
      <span class="">Wheel</span>
    </div>
    <div class="flex flex-col onacona tracking-[-.1em]  text-[18px] leading-2.5  items-center ">
      <SpriteAnimator style="transform: translateX(4px) translateY(-2px);" :animation-data="LeaderNewAnimation"
        :image-url="leaderImageUrl" :width="60" :height="60" :frame-count="LeaderNewAnimation.frames.length"
        :initial-delay-max="4" :loop-delay="7" />
      <span class="">Leaders</span>
    </div>
    <div class="flex flex-col onacona tracking-[-.1em]  text-[18px] leading-2.5 items-center text-white mb-4">
      <ChatPanel />
    </div>
    <div class="flex flex-col onacona tracking-[-.1em]  text-[18px] leading-2.5  items-center text-white">
      <SpriteAnimator :animation-data="VaultAnimation" :image-url="vaultImageUrl" :width="60" :height="60"
        :frame-count="VaultAnimation.frames.length" :initial-delay-max="6" :loop-delay="7" />
      <span class="">Vault</span>
    </div>
    <div class="flex flex-col onacona tracking-[-.1em]  text-[12px] leading-2.5 items-center text-white">
      <SpriteAnimator style="transform: scale(1.3) translateY(4px) translateX(-4px); transform-origin: center"
        :animation-data="RewardsAnimation" :image-url="rewardsImageUrl" :width="60" :height="60"
        :frame-count="RewardsAnimation.frames.length" :initial-delay-max="8" :loop-delay="7" />
      <span class="">Rewards</span>
    </div>
  </footer>
</template>
<style scoped></style>

<script setup lang="ts">
import SpriteAnimator from './SpriteAnimator.vue';

// Import animation data
import LeaderNewAnimation from '@/assets/anim/leadernew.json';
import RewardsAnimation from '@/assets/anim/rewards.json';
import VaultAnimation from '@/assets/anim/vault.json';
import WheelAnimation from '@/assets/anim/wheel.json';

// Import sprite sheet images
import leaderImageUrl from '@/assets/anim/leadernew.png';
import rewardsImageUrl from '@/assets/anim/rewards.png';
import vaultImageUrl from '@/assets/anim/vault.png';
import wheelImageUrl from '@/assets/anim/wheel.png';

const { isMobile } = useScreen()
</script>
