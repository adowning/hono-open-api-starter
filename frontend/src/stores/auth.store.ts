/* eslint-disable @typescript-eslint/no-explicit-any */
import router from '@/router'
import {
    getAuthMe,
    postAuthLogin,
    postAuthSignup,
    type User,
} from '@/sdk/generated'
import { client } from '@/sdk/generated/client.gen'
import { webSocketService } from '@/services/websocket.service'
import { pinia } from '@/stores'
import localforage from 'localforage'
import { defineStore } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import { useNotificationStore } from './notification.store'
import { useAppStore } from './app.store'
import { useDepositStore } from './deposit.store'
import { useGameStore } from './game.store'
import { useGameSpinStore } from './gamespin.store'
import { useVipStore } from './vip.store'

interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export const useAuthStore = defineStore('auth', () => {
    const notificationStore = useNotificationStore()

    const currentUser = ref<User | null>(null)
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isSignUpMode = ref(false)
    let interceptorId: number | null = null

    // Set tokens in state and localforage
    const setTokens = async (tokens: AuthTokens) => {
        accessToken.value = tokens.accessToken
        refreshToken.value = tokens.refreshToken
        await localforage.setItem('accessToken', tokens.accessToken)
        await localforage.setItem('refresh_token', tokens.refreshToken)

        if (interceptorId !== null) {
            client.instance.interceptors.request.eject(interceptorId)
        }

        interceptorId = client.instance.interceptors.request.use((config) => {
            config.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
            return config
        })
        console.log('Tokens set:', tokens)
    }


    // Clear auth state
    const clearAuth = async () => {
        currentUser.value = null
        accessToken.value = null
        refreshToken.value = null
        await localforage.removeItem('accessToken')
        await localforage.removeItem('refresh_token')
        if (interceptorId !== null) {
            client.instance.interceptors.request.eject(interceptorId)
            interceptorId = null
        }
    }

    // Sign up a new user
    const signUp = async (credentials: {
        username: string
        password: string
    }) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await postAuthSignup({
                body: {
                    username: credentials.username,
                    password: credentials.password,
                },
            })

            if (response.data) {
                const {
                    accessToken: at,
                    refreshToken: rt,
                    user: userData,
                } = response.data
                if (at && rt) {
                    await setTokens({ accessToken: at, refreshToken: rt })
                    currentUser.value = userData
                    notificationStore.addNotification({
                        type: 'success',
                        message: 'Registration successful!',
                    })
                    return true
                }
            }
            return false
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Registration failed'
            notificationStore.addNotification({
                type: 'error',
                message: error.value || 'An error occurred',
            })
            return false
        } finally {
            isLoading.value = false
        }
    }

    // Login user
    const login = async (credentials: {
        username: string
        password: string
    }) => {
        const appStore = useAppStore()
        const gameSpinStore = useGameSpinStore()
        const gameStore = useGameStore()
        const vipStore = useVipStore()
        try {
            appStore.showLoading()

            isLoading.value = true
            error.value = null

            // Use the API client to handle the login
            const response = await postAuthLogin({
                body: {
                    username: credentials.username,
                    password: credentials.password,
                },
            })

            // The response should be the actual data, not a Response object
            const responseData = response.data as any // Temporary any to access properties

            if (!responseData) {
                appStore.hideLoading()
                throw new Error('No data received from server')
            }

            if (responseData.error) {
                throw new Error(responseData.error.message || 'Login failed')
            }

            // Set tokens if they exist in the response
            if (responseData.accessToken) {
                await setTokens({
                    accessToken: responseData.accessToken,
                    refreshToken: responseData.refreshToken || '',
                })
                try {
                    await Promise.all([
                        getSession(),
                        gameStore.fetchAllGames(),
                        // gameStore.fetchAllGameCategories(),
                        gameSpinStore.fetchTopWins(),
                        vipStore.fetchAllVipLevels(),
                    ])
                    // Initialize WebSocket connection after successful login
                    webSocketService.initConnection()


                    // Redirect to home page
                    router.push('/')

                    appStore.hideLoading()

                    return responseData
                } catch (e) {
                    console.log(e)
                    appStore.hideLoading()
                    clearAuth()
                    router.push('/login')

                }
            } else {
                throw new Error('Invalid response from server')
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to login'
            error.value = errorMessage

            notificationStore.addNotification({
                type: 'error',
                message: errorMessage,
            })

            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Get current session
    const getSession = async () => {
        const vipStore = useVipStore()
        const depositStore = useDepositStore()
        if (!accessToken.value) return null

        try {
            const response = await getAuthMe()
            if (response.data && response.data.wallet) {
                currentUser.value = response.data.user // The response is already typed from the SDK
                vipStore.setVipInfo(response.data.vipInfo)
                depositStore.setDepositInfo({
                    wallet: response.data.wallet as any,
                    operator: response.data.operator as any,
                })
                return response.data
            }
            return null
        } catch (err: any) {
            clearAuth()
            return err
        }
    }

    // Check if user is authenticated
    const isAuthenticated = computed(
        () => !!accessToken.value && !!currentUser.value
    )

    // Toggle sign up mode
    const toggleSignUpMode = () => {
        isSignUpMode.value = !isSignUpMode.value
    }

    // Logout
    const logout = () => {
        const router = useRouter()
        // Close WebSocket connections before logging out
        webSocketService.closeConnections()
        clearAuth()
        router.push('/login')
    }

    // Initialize auth state
    // Initialize WebSocket connection
    const initWebSocket = (): void => {
        if (accessToken.value && !webSocketService.isConnected()) {
            webSocketService.initConnection()
        }
    }

    // Close WebSocket connection
    const closeWebSocket = (): void => {
        webSocketService.closeConnections()
    }

    // Initialize the store
    const init = async (): Promise<void> => {
        const at = await localforage.getItem('accessToken') as string | null
        const rt = await localforage.getItem('refresh_token') as string | null

        if (at && rt) {
            try {
                await setTokens({ accessToken: at, refreshToken: rt })
                await getSession()
                initWebSocket()
            } catch (error) {
                console.error('Failed to initialize session:', error)
                // Clear invalid auth state
                clearAuth()
            }
        }
    }
    

    // // Call init on store creation
    init()

    return {
        // State
        currentUser,
        accessToken,
        refreshToken,
        isLoading,
        error,
        isSignUpMode,

        // Getters
        isAuthenticated,

        // Actions
        setTokens,
        clearAuth,
        signUp,
        login,
        getSession,
        toggleSignUpMode,
        logout,
        initWebSocket,
        closeWebSocket,
        init,
    }
})
export function useAuthStoreOutside() {
    return useAuthStore(pinia)
}


// Import other stores
