import { computed, ref } from 'vue'
// import { useEventManager } from '@/composables/EventManager'
import { defineStore } from 'pinia'
import {
    getVipLevels,
    getVipMe,
    type VipInfo as ApiVipInfo,
    type VipLevel as ApiVipLevel,
} from '@/sdk/generated'

type VipInfo = ApiVipInfo & { betExp?: number }
type VipLevel = ApiVipLevel & { betExp?: number }

export const useVipStore = defineStore(
    'vip',

    () => {
        const totalXp = ref<number>(0)
        const vipInfo = ref<VipInfo>({} as VipInfo) // Keeping type assertion as in original
        const getTotalXp = computed(() => totalXp.value || 0)
        // const eventManager = useEventManager() // Get an instance of the event manager

        const updateXp = (newTotalXp: number, xpGained: number) => {
            if (vipInfo.value) {
                vipInfo.value.betExp = newTotalXp
            }

            // Emit a global event that the PlayerAvatar component can listen to.
            // eventManager.emit('xp:gain', { xpGained })
            console.log(`VIP Store: Emitted xp:gain event with ${xpGained} XP.`)
        }

        const vipLevels = ref<VipLevel[]>([])

        const getVipInfo = computed(() => vipInfo.value)
        const getVipLevelsComputed = computed(() => vipLevels.value)
        const setVipInfo = (info: VipInfo) => {
            console.log(info)
            vipInfo.value = info
            if (info) {
                totalXp.value = info.betExp || 0 // Update totalXp based on vipInfo
            }
        }
        async function fetchAllVipLevels() {
            try {
                const response = await getVipLevels()
                if (response.data) {
                    vipLevels.value = response.data
                }
            } catch (error) {
                console.error('Failed to fetch VIP levels:', error)
                throw error
            }
        }

        async function fetchVipInfo() {
            try {
                const response = await getVipMe()
                if (response.data?.vipInfo) {
                    setVipInfo(response.data.vipInfo)
                }
                return response.data?.vipInfo
            } catch (error) {
                console.error('Failed to fetch VIP info:', error)
                throw error
            }
        }

        function getPercentOfCurrentLevel() {
            const currentVipInfo = vipInfo.value
            if (!currentVipInfo) {
                return undefined
            }

            const levelInfo = vipLevels.value.find(
                (level) => level.level === currentVipInfo.level
            )
            if (!levelInfo || !levelInfo.betExp) {
                return undefined
            }

            const currentExp = currentVipInfo.betExp ?? 0
            const requiredExp = levelInfo.betExp

            const percentage = Math.floor((currentExp / requiredExp) * 100)
            return [percentage, currentExp, requiredExp]
        }

        return {
            getPercentOfCurrentLevel,
            updateXp,
            fetchAllVipLevels,
            fetchVipInfo,
            getVipInfo,
            getTotalXp,
            setVipInfo,
            getVipLevels: getVipLevelsComputed,
        }
    }
)
