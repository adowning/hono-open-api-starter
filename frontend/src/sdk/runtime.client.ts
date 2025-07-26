/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStoreOutside } from '@/stores/auth.store'
import type { CreateClientConfig } from './generated/client.gen'
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999'

const token = localStorage.getItem('accessToken')
export const createClientConfig: CreateClientConfig = (config: any) => ({
    ...config,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    },
    auth: () =>
        useAuthStore().accessToken || localStorage.getItem('accessToken') || '',
    baseUrl: API_BASE_URL,
})
