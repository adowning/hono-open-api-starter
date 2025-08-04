/* eslint-disable @typescript-eslint/no-explicit-any */
import router from '@/router'
import {
    getApiAuthMe,
    postApiAuthLogin,
    type User,
} from '@/sdk/generated'
import { client } from '@/sdk/generated/client.gen'
import { webSocketService } from '@/services/websocket.service'
import { userWsBridge } from '@/services/ws.user'
import { notificationsWsBridge } from '@/services/ws.notifications'
import { notificationsWsBridge } from '@/services/ws.notifications'
import { pinia } from '@/stores'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAppStore } from './app.store'
import { useDepositStore } from './deposit.store'
import { useGameStore } from './game.store'
import { useGameSpinStore } from './gamespin.store'
import { useNotificationStore } from './notification.store'
import { useVipStore } from './vip.store'

interface AuthTokens {
    accessToken: string
    /**
     * Optional refresh token used when third‑party cookies are blocked.
     * When present, we will send it in Authorization for /api/auth/refresh.
     */
    refreshToken?: string | null
}

export const useAuthStore = defineStore('auth', () => {
    const notificationStore = useNotificationStore()

    const currentUser = ref<User | null>(null)
    const accessToken = ref<string | null>(null)
    // Persist refresh token in sessionStorage to survive reloads but clear on browser close
    const refreshToken = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isSignUpMode = ref(false)
    // readiness flag to coordinate guards/UI bootstrap
    const authReady = ref(false)
    let interceptorId: number | null = null

    // Single-flight refresh tracking
    let isRefreshing = false
    let refreshPromise: Promise<string | null> | null = null
    const pendingRequests: Array<() => void> = []

    // Set tokens in state and (re)install interceptors
    const setTokens = async (tokens: AuthTokens) => {
        accessToken.value = tokens.accessToken
        // Capture optional refresh token if provided by backend (cookie-less fallback)
        if (typeof tokens.refreshToken === 'string' && tokens.refreshToken.length > 0) {
            refreshToken.value = tokens.refreshToken
            try {
                sessionStorage.setItem('cfc_refresh_token', tokens.refreshToken)
            } catch {}
        }

        if (interceptorId !== null) {
            client.instance.interceptors.request.eject(interceptorId)
            client.instance.interceptors.response.eject(interceptorId + 100000) // response id offset
        }

        // Request interceptor: attach Authorization
        const reqId = client.instance.interceptors.request.use((config) => {
            try {
                const url = config.url || ''
                const isAuthEndpoint =
                    url.includes('/api/auth/login') ||
                    url.includes('/api/auth/signup') ||
                    url.includes('/api/auth/refresh') ||
                    url.includes('/auth/login') ||
                    url.includes('/auth/signup') ||
                    url.includes('/auth/refresh')

                const at = accessToken.value || tokens.accessToken
                if (!isAuthEndpoint && at) {
                    config.headers.set('Authorization', `Bearer ${at}`)
                } else {
                    config.headers.delete?.('Authorization')
                }
                // ensure cookies are sent for refresh and same-site calls
                ;(config as any).withCredentials = true
            } catch (e) {
                console.debug('[axios][request] interceptor error', e)
            }
            return config
        })
        interceptorId = reqId

        // Response interceptor: single-flight 401 -> refresh -> retry
        client.instance.interceptors.response.use(
            (response) => response,
            async (error: any) => {
                const originalRequest = error?.config
                const status = error?.response?.status

                if (status === 401 && !originalRequest?._retry) {
                    originalRequest._retry = true

                    // Queue pending requests while refreshing
                    if (!isRefreshing) {
                        isRefreshing = true
                        refreshPromise = refreshAccessToken()
                            .catch(() => null)
                            .finally(() => {
                                isRefreshing = false
                            })
                    }

                    const newToken = await refreshPromise
                    if (newToken) {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                        // drain queued resolvers
                        pendingRequests.splice(0).forEach((resolve) => resolve())
                        return client.instance(originalRequest)
                    }

                    // refresh failed
                    pendingRequests.splice(0).forEach((resolve) => resolve())
                    await clearAuth()
                    router.push('/login')
                    return Promise.reject(error)
                }

                return Promise.reject(error)
            }
        )
        // Keep reference to request interceptor only
        interceptorId = reqId
        console.log('Access token set.')
    }


    // Clear auth state
    const clearAuth = async () => {
        currentUser.value = null
        accessToken.value = null
        refreshToken.value = null
        try {
            sessionStorage.removeItem('cfc_refresh_token')
        } catch {}
        if (interceptorId !== null) {
            client.instance.interceptors.request.eject(interceptorId)
            // Best effort: response interceptor ejection paired
            try {
                client.instance.interceptors.response.eject(interceptorId + 100000)
            } catch {}
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
            const response = await postApiAuthSignup({
                body: {
                    username: credentials.username,
                    password: credentials.password,
                },
            })

            if (response.data) {
                const { accessToken: at } = response.data as any
                if (at) {
                    await setTokens({ accessToken: at })
                    // optional: currentUser is loaded by getSession
                    notificationStore.addNotification({
                        type: 'success',
                        message: 'Registration successful!',
                    })
                    await getSession()
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

            const response = await postApiAuthLogin({
                body: {
                    username: credentials.username,
                    password: credentials.password,
                },
            })
            const responseData = response.data as any

            if (!responseData) {
                appStore.hideLoading()
                throw new Error('No data received from server')
            }
            if (responseData.error) {
                throw new Error(responseData.error.message || 'Login failed')
            }

            if (responseData.accessToken) {
                // Accept optional refreshToken from server for cookie-less fallback
                await setTokens({
                    accessToken: responseData.accessToken,
                    refreshToken: responseData.refreshToken ?? null,
                })
                try {
                    console.debug('[auth][login] tokens set; fetching bootstrap data...')
                    await Promise.all([
                        getSession(),
                        gameStore.fetchAllGames(),
                        gameSpinStore.fetchTopWins(),
                        vipStore.fetchAllVipLevels(),
                    ])
                    webSocketService.initConnection()

                    try {
                        router.push('/')
                    } catch (e) {
                        console.log(e)
                    }
                    appStore.hideLoading()

                    return responseData
                } catch (e) {
                    console.log(e)
                    appStore.hideLoading()
                    await clearAuth()
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
            console.debug('[auth][getSession] requesting...')
            const response = await getApiAuthMe()
            console.debug('[auth][getSession] response ok=', !!response.data)
            if (response.data && response.data.wallet) {
                currentUser.value = response.data.user
                vipStore.setVipInfo(response.data.vipInfo)
                depositStore.setDepositInfo({
                    wallet: response.data.wallet as any,
                    operator: response.data.operator as any,
                })
                return response.data
            }
            return null
        } catch (err: any) {
            console.debug('[auth][getSession] failed, attempting refresh', err?.message || err)
            // Try a one-time refresh if session fetch failed
            const newToken = await refreshAccessToken().catch(() => null)
            if (newToken) {
                try {
                    const response = await getApiAuthMe()
                    if (response.data && response.data.wallet) {
                        currentUser.value = response.data.user
                        vipStore.setVipInfo(response.data.vipInfo)
                        depositStore.setDepositInfo({
                            wallet: response.data.wallet as any,
                            operator: response.data.operator as any,
                        })
                        return response.data
                    }
                } catch {
                    // fallthrough to clear
                }
            }
            await clearAuth()
            return err
        }
    }

    // Check if user is authenticated
    const isAuthenticated = computed(
        () => !!currentUser.value
    )

    // Toggle sign up mode
    const toggleSignUpMode = () => {
        isSignUpMode.value = !isSignUpMode.value
    }

    // Logout
    const logout = () => {
        const router = useRouter()
        try {
            webSocketService.closeConnections()
        } finally {
            userWsBridge.close()
            notificationsWsBridge.close()
        }
        clearAuth()
        router.push('/login')
    }

    // Initialize auth state
    // Initialize WebSocket connection
    const initWebSocket = (): void => {
        if (accessToken.value) {
            if (!webSocketService.isConnected()) {
                webSocketService.initConnection()
            }
            userWsBridge.connect(accessToken.value)
            notificationsWsBridge.connect(accessToken.value)
        }
    }

    // Close WebSocket connection
    const closeWebSocket = (): void => {
        try {
            webSocketService.closeConnections()
        } finally {
            userWsBridge.close()
            notificationsWsBridge.close()
        }
    }

    // Refresh the access token using the refresh cookie
    const refreshAccessToken = async (): Promise<string | null> => {
        // Step 1: try cookie-based refresh (works when third-party cookies allowed)
        try {
            const res = await client.instance.post('/api/auth/refresh', null, {
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                },
            })
            const at = res?.data?.accessToken as string | undefined
            if (at) {
                await setTokens({ accessToken: at })
                return at
            }
        } catch (e) {
            console.debug('[auth][refresh][cookie] failed', e)
        }

        // Step 2: fallback to Authorization: Bearer <refreshToken> when cookies are blocked
        try {
            const rt =
                refreshToken.value ||
                (() => {
                    try {
                        return sessionStorage.getItem('cfc_refresh_token')
                    } catch {
                        return null
                    }
                })()

            if (!rt) {
                return null
            }

            const res2 = await client.instance.post('/api/auth/refresh', null, {
                withCredentials: false,
                headers: {
                    Authorization: `Bearer ${rt}`,
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                },
            })
            const at2 = res2?.data?.accessToken as string | undefined
            if (at2) {
                await setTokens({ accessToken: at2 })
                return at2
            }
        } catch (e) {
            console.debug('[auth][refresh][auth-fallback] failed', e)
        }

        return null
    }

    // Initialize the store
    const init = async (): Promise<void> => {
        try {
            client.instance.defaults.withCredentials = true

            // Load refresh token from sessionStorage for fallback flow
            try {
                const rt = sessionStorage.getItem('cfc_refresh_token')
                if (rt) refreshToken.value = rt
            } catch {}

            // Attempt silent refresh to avoid weekly re-login
            const at = await refreshAccessToken()
            if (at) {
                await getSession()
                initWebSocket()
            }
        } catch (error) {
            console.error('Failed to initialize session:', error)
            await clearAuth()
        } finally {
            authReady.value = true
        }
    }


    // // Call init on store creation
    init()

    return {
        // State
        currentUser,
        accessToken,
        isLoading,
        error,
        isSignUpMode,
        authReady,

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
