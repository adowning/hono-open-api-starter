/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from './notification.store'
import { webSocketService } from '@/services/websocket.service'
import {
    postAuthSignup,
    getAuthMe,
    postAuthLogin,
    type User,
} from '@/sdk/generated'
import { pinia } from '@/stores'

interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export const useAuthStore = defineStore('auth', () => {
    const notificationStore = useNotificationStore()

    const currentUser = ref<User | null>(null)
    const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
    const refreshToken = ref<string | null>(
        localStorage.getItem('refresh_token')
    )
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isSignUpMode = ref(false)

    // Set tokens in state and localStorage
    const setTokens = (tokens: AuthTokens) => {
        accessToken.value = tokens.accessToken
        refreshToken.value = tokens.refreshToken
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refresh_token', tokens.refreshToken)
    }

    const setAccessToken = (token: string) => {
        accessToken.value = token
        localStorage.setItem('accessToken', token)
    }

    // Clear auth state
    const clearAuth = () => {
        currentUser.value = null
        accessToken.value = null
        refreshToken.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refresh_token')
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
                    setTokens({ accessToken: at, refreshToken: rt })
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
        const router = useRouter()
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
                setTokens({
                    accessToken: responseData.accessToken,
                    refreshToken: responseData.refreshToken || '',
                })
                await Promise.all([
                    getSession(),
                    gameStore.fetchAllGames(),
                    gameStore.fetchAllGameCategories(),
                    gameSpinStore.getTopWins(),
                    vipStore.fetchAllVipLevels(),
                ])
                // Initialize WebSocket connection after successful login
                webSocketService.initConnection()

                // Redirect to home page
                router.push('/')

                appStore.hideLoading()

                return responseData
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
        if (!accessToken.value) return null

        try {
            const response = await getAuthMe()
            if (response.data) {
                currentUser.value = response.data.user // The response is already typed from the SDK
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
    // const init = async (): Promise<void> => {
    //     if (accessToken.value) {
    //         try {
    //             await getSession()
    //             initWebSocket()
    //         } catch (error) {
    //             console.error('Failed to initialize session:', error)
    //             // Clear invalid auth state
    //             clearAuth()
    //         }
    //     }
    // }
    onUnmounted(() => {
        closeWebSocket()
    })

    // // Call init on store creation
    // init()

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
        setAccessToken,
        clearAuth,
        signUp,
        login,
        getSession,
        toggleSignUpMode,
        logout,
        initWebSocket,
        closeWebSocket,
    }
})
export function useAuthStoreOutside() {
    return useAuthStore(pinia)
}
