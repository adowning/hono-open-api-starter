// API Client with TypeScript support

// Core types
type ApiMethod<T = unknown> = {
    $get: (options?: RequestInit) => Promise<T>
    $post: (
        body?: unknown,
        options?: Omit<RequestInit, 'body' | 'method'>
    ) => Promise<T>
    $put: (
        body?: unknown,
        options?: Omit<RequestInit, 'body' | 'method'>
    ) => Promise<T>
    $delete: (options?: Omit<RequestInit, 'method'>) => Promise<T>
}

type ApiClient = {
    [key: string]: ApiMethod
}

// Helper to get auth token from the same source as the app store
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null
    try {
        // Prefer live token from Pinia store if available to avoid stale localStorage
        const at = useAuthStore().accessToken
        if (at && typeof at === 'string') {
            return at
        }
    } catch {
        // ignore if store not available yet
    }
    try {
        // Fallback: attempt a previously persisted token locations (kept for safety)
        const authData = localStorage.getItem('auth-store')
        if (authData) {
            const parsed = JSON.parse(authData)
            return parsed?.accessToken ?? null
        }
    } catch (e) {
        console.error('Failed to parse auth data from localStorage', e)
    }
    return null
}

// Handler for the API client proxy
const createApiHandler = (baseUrl: string) => {
    const fetchWithAuth = async <T>(
        input: RequestInfo | URL,
        init: RequestInit = {}
    ): Promise<T> => {
        // Pull token from localStorage fallback only; generated client handles pinia-based token.
        const token = getAuthToken()
        const headers = new Headers(init.headers)

        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        } else {
            headers.delete('Authorization')
        }
        // Temporary debug
         
        console.debug('[fetch][request]', typeof input === 'string' ? input : (input as URL).toString?.() ?? 'req', 'authHeader=', !!token, 'credentials=include')

        let body: BodyInit | null = null
        if (init.body) {
            if (
                typeof init.body === 'object' &&
                !(init.body instanceof FormData)
            ) {
                if (!headers.has('Content-Type')) {
                    headers.set('Content-Type', 'application/json')
                }
                body = JSON.stringify(init.body)
            } else {
                body = init.body as BodyInit
            }
        }

        const response = await fetch(input, {
            // Ensure cookie-backed sessions are sent for endpoints that require it
            credentials: 'include',
            ...init,
            headers,
            body,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: 'API request failed',
            }))
            throw new Error(error.message || 'API request failed')
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            return undefined as unknown as T
        }

        return response.json()
    }

    // Create a method handler for each endpoint
    const createMethodHandler = (endpoint: string): ApiMethod => ({
        $get: <T>(options: RequestInit = {}) =>
            fetchWithAuth<T>(endpoint, { ...options, method: 'GET' }),
        $post: <T>(
            body: unknown,
            options: Omit<RequestInit, 'body' | 'method'> = {}
        ) => {
            const requestBody = body !== undefined ? body : null
            return fetchWithAuth<T>(endpoint, {
                ...options,
                method: 'POST',
                body: requestBody as BodyInit | null,
            })
        },
        $put: <T>(
            body: unknown,
            options: Omit<RequestInit, 'body' | 'method'> = {}
        ) => {
            const requestBody = body !== undefined ? body : null
            return fetchWithAuth<T>(endpoint, {
                ...options,
                method: 'PUT',
                body: requestBody as BodyInit | null,
            })
        },
        $delete: <T>(options: Omit<RequestInit, 'method'> = {}) =>
            fetchWithAuth<T>(endpoint, { ...options, method: 'DELETE' }),
    })

    // Create a proxy that creates method handlers on demand
    const handler: ProxyHandler<ApiClient> = {
        get(_, prop: string): ApiMethod {
            if (typeof prop !== 'string') {
                throw new Error('API namespace must be a string')
            }
            const endpoint = `${baseUrl}/${prop}`
            return createMethodHandler(endpoint)
        },
    }

    return new Proxy({} as ApiClient, handler)
}

// Create and export API client instance
const api = createApiHandler(
    import.meta.env.VITE_API_BASE_URL || 'https://api.cashflowcasino.com'
)

export { api }
export type { InferResponseType } from 'hono/client'
