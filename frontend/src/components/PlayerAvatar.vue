<script setup lang="ts">
import { ref, computed, watch, onMounted, } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { useVipStore } from '@/stores/vip.store'
import { useEventManager } from '@/composables/EventManager' // Assuming this is the correct path
// If CircleProgressBar and SparklesSprite are globally registered, no import needed.
// Otherwise, import them here:
// import CircleProgressBar from '@/components/CircleProgressBar.vue'
// import SparklesSprite from '@/components/SparklesSprite.vue'

// Props
interface Props {
  sparkle?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  sparkle: false,
})

// Stores
const authStore = useAuthStore()
const vipStore = useVipStore() // Use the store instance directly
const localSparkle = ref(props.sparkle)
const eventBus = useEventManager()
// const currentUser = ref(authStore.currentUser)
const { currentUser } = storeToRefs(authStore)
// const { vipInfo } = storeToRefs(vipStore)

// const { currentUser } = storeToRefs(authStore)
// It's generally better to get reactive state from the store using storeToRefs or computed properties
// to ensure reactivity is maintained.
const vipInfo = computed(() => vipStore.getVipInfo) // Assuming getVipInfo is a getter or a reactive object

// Constants
// const XP_LEVEL_SCALE = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]

// Local State
// const gainingExp = ref(false)
const circleRef = ref<HTMLElement | null>(null) // For the glow effect, if still needed
// const percentOfLevelGained = ref(0)
const xpNeededForNextLevel = ref(0)
const currentXp = ref(0)
// Event Bus

// Computed Properties
// const currentLevel = computed(() => vipInfo.value.level || 0)
// const currentBetExp = computed(() => vipInfo.value.bet_exp || 0)
// const currentRankBetExp = computed(() => vipInfo.value.rank_bet_exp || 0)
// const currentUserTotalXp = computed(() => vipInfo.value.xp || 0)
// const currentUsername = computed(() => currentUser.value?.username || '')
// const currentUserImage = computed(() => currentUser.value?.avatar || 'avatar-5.webp') // Provide a default

// const nextXpThreshold = computed(() => {
//   if (currentLevel.value >= 0 && currentLevel.value < XP_LEVEL_SCALE.length) {
//     return XP_LEVEL_SCALE[currentLevel.value]
//   }
//   return Infinity // Or a very large number if level is out of bounds
// })

// const xpPercentageToNextLevel = computed(() => {
//   if (nextXpThreshold.value === 0 || nextXpThreshold.value === Infinity) return 0
//   const expTowardsNext = currentBetExp.value % nextXpThreshold.value // XP accumulated within the current level
//   const requiredForLevel = nextXpThreshold.value - (XP_LEVEL_SCALE[currentLevel.value - 1] || 0) // Total XP needed for this specific level
//   if (requiredForLevel === 0) return 100 // Avoid division by zero if already at max XP for level 0 or error
//   return Math.min((currentBetExp.value / nextXpThreshold.value) * 100, 100) // Percentage of currentBetExp towards the next threshold
// })

// const betRatePercentage = computed(() => {
//   if (!currentRankBetExp.value) return 0 // Avoid division by zero
//   const rate = (currentBetExp.value / currentRankBetExp.value) * 100
//   return Math.min(rate, 100) // Cap at 100%
// })

// const displayUsername = computed(() => {
//   return currentUsername.value.substring(0, 8)
// })

// const usernameFontSizeClass = computed(() => {
//   return (currentUsername.value?.length || 0) <= 6 ? 'text-lg' : 'text-base' // Using Tailwind classes
// })

// // Methods
// function showProfileModal() {
//   eventBus.emit('profileOpen', true)
// }

function pulseGlowEffect() {
  console.log('Pulsing glow effect')
  if (circleRef.value) {
    circleRef.value.classList.add('glow')
    localSparkle.value = true;

    setTimeout(() => {
      localSparkle.value = false;

    }, 1000)
    setTimeout(() => {
      circleRef.value?.classList.remove('glow')
    }, 2000)
  }
}

// Watchers
watch(() => props.sparkle, (isSparkling) => {
  if (isSparkling) {
    localSparkle.value = true;
    setTimeout(() => {
      localSparkle.value = false;
    }, 3000); // Animation duration
  }
});
// watch(() => currentUser, (user) => {
//   console.log(user)
//   // if (isSparkling) {
//   //     localSparkle.value = true;
//   //     setTimeout(() => {
//   //         localSparkle.value = false;
//   //     }, 3000); // Animation duration
//   // }
// });
watch(
  () => vipStore.getVipInfo,
  (newVipInfo, oldVipInfo) => {
    if (newVipInfo?.betExp !== undefined) {
      const oldXp = oldVipInfo?.betExp || 0
      const newXp = newVipInfo.betExp
      console.log('VIP XP changed:', { oldXp, newXp })
      currentXp.value = newXp

      if (newXp > oldXp) {
        pulseGlowEffect()
      }
    }
  },
  { deep: true }
)
// Listen for XP gain events
const handleXpGain = () => {
  const result = vipStore.getPercentOfCurrentLevel()
  if (result) {
    xpNeededForNextLevel.value = result[2]
    currentXp.value = result[1]
    pulseGlowEffect()
  }
}

// Use the event manager from the VIP store
eventBus.on('xp:gain', handleXpGain)
// function profileGetLevelProgress() {
//   return Math.floor((currentUser.value?.vipInfo.level! >= 100 ? 2970100 * 1000 : currentUser.value?.vipInfo.xp! - (Math.pow(currentUser.value?.vipInfo.level!, 3) * 100 * 1000)) / 10) / 100;
// }
// Event Bus Listener
onMounted(async () => {
  try {
    // Fetch VIP levels if not already loaded
    if (!vipStore.getVipLevels.length) {
      await vipStore.fetchAllVipLevels()
    }

    // Initialize XP display
    const result = vipStore.getPercentOfCurrentLevel()
    if (result) {
      xpNeededForNextLevel.value = result[2]
      currentXp.value = result[1]
    }
  } catch (error) {
    console.error('Failed to initialize VIP data:', error)
  }
  eventBus.on('xp:gain', () => {
    console.log('PlayerAvatar: xp:gain event received, starting animation.');
    localSparkle.value = true;
    // Turn sparkle off after animation duration
    setTimeout(() => {
      localSparkle.value = false;
    }, 3000); // Must match animation duration
  }, 'PlayerAvatar'); // Unique target for safe un-subscription
})
</script>

<template>
  <div v-if="currentUser && vipInfo" class="relative w-[60px] h-[70px] ml-[15px] mt-[1px] z-[2]">
    <div class="relative w-[60px] h-[60px] z-[999]">
      <div ref="circleRef"
        class="player-avatar-wrapper  flex items-center justify-center overflow-hidden rounded-full w-full h-full"
        :class="{ glow: sparkle }">
        <div class="absolute inset-[3px] bg-cover bg-center rounded-full z-999 "
          style=" z-index: 9999; background-size: cover "
          :style="`background-image: url('/images/avatars/${currentUser.avatar}')`" />
        <AnimatedCircularProgressBar :gaugePrimaryColor="'red'" :duration="3" :gaugeSecondaryColor="'yellow'"
          :gaugeWidth="10" :max="100" :showPercentage="false" :circle-stroke-width="10" :min="0" :value="currentXp / 2"
          class="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] z-[1] -rotate-70" />
        <!-- <CircleProgressBar stroke-width="20" :value="currentXp" :max="xpNeededForNextLevel" color-unfilled="yellow"
          animation-duration="1s" color-filled="yellow" color-back="red" :start-angle="190"
          class="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] z-[1]" /> -->
      </div>
    </div>

    <div
      class="text-base  w-[80px] absolute left-[-10px] m-auto  bottom-[6px] z-[999]  bg-white opacity-99 rounded border border-[#6f14a3] shadow-[0px_0px_4px_#6f14a3] text-black font-extrabold text-center">
      <div class="leading-2  onacona overflow-hidden text-clip  flex justify-center p-1" style="font-size: 15px"> {{
        currentUser.username
        }}
      </div>
    </div>

    <div class="absolute top-[18px] left-[-16px] w-[36px] h-[36px] z-[9999] bg-cover cursor-pointer"
      style="background-image: url('/images/avatars/level-star.avif')">
      <div class="flex leading-1 items-center justify-center h-full text-lg onacona text-black pr-1 pt-1 "
        style="color: black">
        {{ vipInfo.level }}
      </div>
    </div>

    <div v-if="localSparkle" class="absolute left-[-5px] top-[-4px] w-[60px] h-[30px] z-[999999]">
      <SparklesSprite />
    </div>
  </div>
</template>

<style scoped>
/* Prefer Tailwind for styling, but keep complex animations or specific CSS here */

.glow {
  animation: pulse-glow 2s linear;
}

@keyframes pulse-glow {

  0%,
  100% {
    filter: drop-shadow(0 0 5px #c22998);
  }

  50% {
    filter: drop-shadow(0 0 10px #8b5df4);
  }
}

/* Removed other CSS that can be replaced by Tailwind or is no longer used
   (e.g., .progress, .circle-progress definitions, input[type=range], .img-wrap)
   If CircleProgressBar needs specific global styles, they should be defined where it's globally styled.
*/
</style>
