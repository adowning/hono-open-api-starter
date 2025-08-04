/* eslint-disable @typescript-eslint/no-explicit-any */
// import localforage from 'localforage'
import type { CreateClientConfig } from './generated/client.gen'
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://api.cashflowcasino.com'

// const token = await localforage.getItem('auth')
export const createClientConfig: CreateClientConfig = (config: any) => ({
    ...config,
    // Ensure cookies are sent with all requests from the generated Axios client
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    },
    auth: () =>
        useAuthStore().accessToken || '',
    baseURL: API_BASE_URL,
})
