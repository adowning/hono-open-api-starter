/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { defineStore } from 'pinia'
// import { ref } from 'vue'
// import { handleException } from './exception'
// import { api } from '@/sdk/api'
// import type { InferResponseType } from 'hono/client'
// import { getGamesAll } from '@/sdk/generated'

import { GameSpin, getGamespinsTopwins } from '@/sdk/generated'

// type Game = InferResponseType<typeof api.games.all.$get>[0]

export const useGameSpinStore = defineStore('gameSpin', () => {
    //     // --- State ---
    // const spins = ref<Game[]>([])
    const topWins = ref<GameSpin[]>([])
    // const selectedSpin = ref<Game | null>(null)
    const isLoading = ref(false)
    const errMessage = ref('')

    //     // --- Actions ---

    //     /**
    //      * Fetches all game spins for the currently authenticated user.
    //      */
    //     async function dispatchGetUserSpins(): Promise<void> {
    //         isLoading.value = true
    //         errMessage.value = ''
    //         try {
    //             const { data, error } = await getGamesAll()
    //             if (error || !data) throw new Error('Failed to get user spins')
    //             spins.value = await data.json()
    //         } catch (error: any) {
    //             errMessage.value = handleException(error.code || 500)
    //             spins.value = []
    //         } finally {
    //             isLoading.value = false
    //         }
    //     }

    //     /**
    //      * Fetches the top 10 winning spins.
    //      */
    async function fetchTopWins(): Promise<void> {
        isLoading.value = true
        errMessage.value = ''
        try {
            const { data,  } = await getGamespinsTopwins()
            if ( !data) throw new Error('Failed to get top wins')
            topWins.value = data
        } catch (error: any) {
            errMessage.value = handleException(error.code || 500)
            topWins.value = []
        } finally {
            isLoading.value = false
        }
    }

    //     /**
    //      * Fetches a single game spin by its ID.
    //      * @param {string} id - The ID of the spin to fetch.
    //      */
    //     async function dispatchGetSpinById(id: string) {
    //         isLoading.value = true
    //         errMessage.value = ''

    //         try {
    //             const response = await getSpinById(id)

    //             if (!response.ok) {
    //                 throw new Error('Failed to get spin by id')
    //             }

    //             selectedSpin.value = await response.json()
    //         } catch (error: unknown) {
    //             const errorCode = (error as { code?: number })?.code || 500
    //             errMessage.value = handleException(errorCode)
    //         } finally {
    //             isLoading.value = false
    //         }
    //     }

    return {
        //         // State
        //         spins,
        topWins,
        //         selectedSpin,
        //         isLoading,
        //         errMessage,

        //         // Actions
        //         dispatchGetUserSpins,
        //         dispatchGetSpinById,
        fetchTopWins,
    }
})
