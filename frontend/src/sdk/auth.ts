/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth.store'
import { useGameStore } from '@/stores/game.store'
import { useGameSpinStore } from '@/stores/gameSpin.store'
import { useVipStore } from '@/stores/vip.store'
import { useMutation } from '@tanstack/vue-query'
import { postAuthLogin } from './generated/sdk.gen'

type LoginRequest = {
    username: string
    password: string
}

type LoginResponse = {
    accessToken: string
    user: {
        id: string
        username: string
        email: string | null
    }
}

export function useLogin() {
    const authStore = useAuthStore()
    const appStore = useAppStore()
    const gameSpinStore = useGameSpinStore()

    const gameStore = useGameStore()
    const vipStore = useVipStore()

    return useMutation({
        mutationFn: async (
            credentials: LoginRequest
        ): Promise<LoginResponse> => {
            const response: any = await postAuthLogin({
                body: credentials,
            })
            if (!response?.ok) {
                const error = await response?.json()
                throw new Error(error.message || 'Login failed')
            }
            return response?.json()
        },
        onMutate: () => {
            appStore.showLoading()
        },
        onSuccess: async (data) => {
            console.log(data)
            if (data) {
                // Set the core auth data immediately
                authStore.setAccessToken(data.accessToken)

                // Now, fetch supplemental user and game data concurrently
                await Promise.all([
                    authStore.getSession(),
                    gameStore.fetchAllGames(),
                    gameStore.fetchAllGameCategories(),
                    gameSpinStore.getTopWins(),
                    vipStore.fetchAllVipLevels(),
                ])
            }
        },
        onSettled: () => {
            appStore.hideLoading()
        },
        onError: (e) => {
            appStore.hideLoading()
            console.log(e)
        },
    })
}
