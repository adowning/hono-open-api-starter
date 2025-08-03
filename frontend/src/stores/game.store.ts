import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import {
    getApiGamesAll,
    getApiGamesCategories,
    postApiGamesLeave,
    postApiUserGamesFavorite,
    postApiGamesByIdEnter,
    type PostApiGamesByIdEnterData,
    type Game,
    type PostApiGamesByIdEnterResponse,
} from '@/sdk/generated'
import { useAppStore } from './app.store'
import { useAuthStore } from './auth.store'

export const useGameStore = defineStore('game', () => {
    const appStore = useAppStore()
    const queryClient = useQueryClient()

    // State
    const games = ref<Game[]>([])
    const categories = ref<string[]>([]) // Changed from GameCategory[] to string[]
    const currentGame = ref<string | null>(null)
    const gameSession = ref<unknown>(null)
    const favorites = ref<string[]>([])
    const currentGameOptions = ref<PostApiGamesByIdEnterResponse | null>(null)
    // Actions
    async function fetchAllGames() {
        try {
            const response = await getApiGamesAll()
            if (response.data) {
                // Transform the response to match our Game type
                const uniqueGames = response.data.reduce<Game[]>(
                    (acc, game) => {
                        if (!acc.some((g) => g.id === game.id)) {
                            game.developer = game.developer.toLowerCase()
                            acc.push({
                                ...game,
                                // Ensure all required fields are present
                                category: game.category || 'slots',
                                tags: Array.isArray(game.tags) ? game.tags : [],
                            } as Game)
                        }
                        return acc
                    },
                    []
                )
                games.value = uniqueGames
            }
        } catch (error) {
            console.error('Failed to fetch games:', error)
            throw error // Re-throw to allow error handling in components
        }
    }
    async function fetchAllGameCategories() {
        try {
            const response = await getApiGamesCategories()
            if (response.data) {
                // Ensure categories is an array of strings
                categories.value = Array.isArray(response.data)
                    ? response.data.map(String)
                    : []
            }
        } catch (error) {
            console.error('Failed to fetch game categories:', error)
            throw error // Re-throw to allow error handling in components
        }
    }
    // Mutations
    // const enterGameMutation = useMutation({
    //   mutationFn: (spinParams: any) => postGamesByIdEnter({ path: { id: spinParams.id, userId: spinParams.userId } }),
    //   onMutate: () => appStore.showLoading(),
    //   onSuccess: (response) => {
    //     currentGame.value = response.data;
    //   },
    //   onSettled: () => appStore.hideLoading(),
    // });

    // ... (other mutations remain the same)

    const toggleFavoriteMutation = useMutation({
        mutationFn: (gameId: string) =>
            postApiUserGamesFavorite({ body: { add_game: gameId } }),
        onMutate: () => appStore.showLoading(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteGames'] })
        },
        onSettled: () => appStore.hideLoading(),
    })

    const enterGame = useDebounceFn(
        async (id: string) => {
            const authStore = useAuthStore()
            const data: PostApiGamesByIdEnterData = {
                path: {
                    id,
                },
                url: '/api/games/{id}/enter',
            }

            if (currentGame.value === id) {
                console.log('Already in game:', id)
                return
            }

            try {
                const response = await postApiGamesByIdEnter(data)
                if (response.data) {
                    if (response.data.gameConfig && authStore.accessToken) {
                        response.data.gameConfig.authToken =
                            authStore.accessToken
                    }
                    currentGame.value = id
                    currentGameOptions.value = response.data
                    return response.data
                }
            } catch (error) {
                console.error('Error entering game:', error)
                throw error
            }
            // gameSession.value = await fetchGameSession(gameId, userId);
        },
        500,
        { maxWait: 5000 }
    )

    const leaveGame = async () => {
        const leaveGame = await postApiGamesLeave()
        console.log(leaveGame)
    }
    // const spin = (params: any) => spinMutation.mutate(params)
    const toggleFavorite = (gameId: string) =>
        toggleFavoriteMutation.mutate(gameId)

    return {
        games, // State
        categories, // State
        currentGame, // State
        gameSession, // State
        currentGameOptions,
        favorites,
        fetchAllGames, // Expose the new action
        fetchAllGameCategories,
        enterGame,
        leaveGame,
        // spin,
        toggleFavorite,
    }
})
