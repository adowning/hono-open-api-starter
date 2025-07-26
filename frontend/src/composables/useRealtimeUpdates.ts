import { useAuthStore } from '@/stores/auth.store'
import { useEventManager } from './EventManager'
import { onUnmounted } from 'vue'
import type { User } from '@/sdk/generated'

export function useRealtimeUpdates() {
  const authStore = useAuthStore()
  const eventManager = useEventManager()

  const setupEventListeners = (): (() => void) => {
    const updateUser = (userData: unknown): void => {
      if (!userData || typeof userData !== 'object' || !authStore.currentUser) return
      
      // Create a new user object with updated properties
      const updatedUser = { ...authStore.currentUser } as User
      const userDataObj = userData as Partial<User>
      
      // Only update existing properties that are allowed
      Object.entries(userDataObj).forEach(([key, value]) => {
        if (key in updatedUser && value !== undefined) {
          // Use type assertion to handle the index signature
          const userKey = key as keyof User
          updatedUser[userKey] = value as never
        }
      })
      
      authStore.currentUser = updatedUser
    }

    const updateWallet = (walletData: unknown): void => {
      // Wallet updates will be handled by the backend through the user object
      if (walletData && typeof walletData === 'object') {
        updateUser({ wallet: walletData })
      }
    }

    const updateVipInfo = (vipData: unknown): void => {
      // VIP info updates will be handled by the backend through the user object
      if (vipData && typeof vipData === 'object') {
        updateUser({ vipInfo: vipData })
      }
    }

    // Register event listeners
    eventManager.on('user:updated', updateUser)
    eventManager.on('wallet:updated', updateWallet)
    eventManager.on('vip:updated', updateVipInfo)

    // Return cleanup function
    return (): void => {
      eventManager.off('user:updated', updateUser)
      eventManager.off('wallet:updated', updateWallet)
      eventManager.off('vip:updated', updateVipInfo)
    }
  }

  onUnmounted(() => {
    setupEventListeners()()
  })

  return {
    setupEventListeners
  }
}
