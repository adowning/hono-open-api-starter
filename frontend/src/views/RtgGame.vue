<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
    <div v-if="!error && gameLaunchOptions" class="w-screen h-screen">
        <GameLoader :launch-options="gameLaunchOptions" />
    </div>
    <div v-else-if="error" class="text-white p-4">
        <p class="font-semibold">Failed to load game.</p>
        <p v-if="errorMessage" class="text-sm opacity-80 mt-2">{{ errorMessage }}</p>
        <pre v-if="__debug" class="mt-3 text-xs opacity-70 whitespace-pre-wrap">{{ debugState }}</pre>
    </div>
    <div v-else class="text-white">
        <p>Loading game...</p>
    </div>
</template>

<script setup lang="ts">
import GameLoader from '@/components/GameLoader.vue'
import { useGameStore } from '@/stores/game.store'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref, computed, watch } from 'vue'

/**
 * Align types with GameLauncher expectations.
 * GameLauncher.buildUrl() requires either game_launcher_url or launch_url to be set.
 * We will set both for safety using an absolute URL.
 */
type LaunchOptions = {
  launch_url: string
  launch_options: {
    game_launcher_url: string
    [key: string]: unknown
  }
}

const gameName = useRouteQuery('gameName')
const gameStore = useGameStore()
const error = ref(!gameName.value)
const errorMessage = ref<string>('')
const gameLaunchOptions = ref<LaunchOptions | null>(null)

// Lightweight debug aid to surface why options are missing in runtime
const __debug = true
const debugState = ref<string>('')

/**
 * Normalize the query and be resilient to different identifiers.
 * We try matching by name (case-insensitive), id, or title.
 */
const normalizedQuery = computed(() => (gameName.value ?? '').toString().trim())

const game = computed(() => {
    const q = normalizedQuery.value
    if (!q) return undefined
    const lower = q.toLowerCase()
    return (
        gameStore.games.find(g => typeof g.name === 'string' && g.name.toLowerCase() === lower) ||
        gameStore.games.find(g => (g as unknown as { id?: string | number }).id?.toString() === q) ||
        gameStore.games.find(g => typeof (g as unknown as { title?: string }).title === 'string' && (g as unknown as { title?: string }).title!.toLowerCase() === lower)
    )
})

async function ensureGamesLoaded() {
    if (gameStore.games.length === 0) {
        await gameStore.fetchAllGames()
    }
}

function setError(msg: string) {
    error.value = true
    errorMessage.value = msg
    if (__debug) {
        debugState.value = JSON.stringify({
            msg,
            hasGames: gameStore.games.length > 0,
            gameMatched: !!game.value,
            currentGameOptionsKeys: gameStore.currentGameOptions ? Object.keys(gameStore.currentGameOptions as any) : [],
            currentGameOptions: gameStore.currentGameOptions,
        }, null, 2)
    }
}

function clearError() {
    error.value = false
    errorMessage.value = ''
    if (__debug) debugState.value = ''
}

async function enterSelectedGame() {
    if (!normalizedQuery.value) {
        setError('Missing gameName in query string.')
        return
    }
    await ensureGamesLoaded()
    if (!game.value) {
        console.error(`Game not found for query "${normalizedQuery.value}"`)
        setError(`Game not found for "${normalizedQuery.value}".`)
        return
    }
    try {
        // Force a small await nextTick-like delay after calling enterGame to give the debounce
        // time to populate currentGameOptions in the store if it returns undefined.
        const response = await gameStore.enterGame((game.value as unknown as { id: string | number }).id.toString())
        let options = response
        if (!options) {
            // wait a tick and re-check store
            options = gameStore.currentGameOptions
        }
        if (!options) {
            // re-check again after a micro delay in case debounce maxWait fulfilled
            await new Promise((r) => setTimeout(r, 10))
            options = gameStore.currentGameOptions
        }

        if (!options) {
            // Last resort: build minimal options directly from known loader URL when API always returns relative path
            // Your backend confirmed: { webUrl: "/games/redtiger/loader.html", gameConfig: {...} }.
            // If response is still not visible here due to debounce timing, we cannot reconstruct webUrl without it,
            // so we surface deep diagnostics.
            setError('No launch options returned from server.')
            return
        }

        const webUrl = (options as any).webUrl ?? (options as any).url
        const gameConfig = (options as any).gameConfig ?? (options as any).config ?? {}

        if (!webUrl) {
            console.error('enterGame options missing webUrl/url', options)
            setError('Launcher URL missing in enterGame response.')
            return
        }

        // Convert relative path from API to absolute URL so the iframe resolves correctly from Vite dev server.
        const absoluteUrl = webUrl.startsWith('http')
            ? webUrl
            : new URL(webUrl, window.location.origin).toString()

        gameLaunchOptions.value = {
            launch_url: absoluteUrl,
            launch_options: {
                game_launcher_url: absoluteUrl,
                ...gameConfig,
            },
        }
        clearError()
        return
    } catch (e) {
        console.error('Failed to enter game', e)
        setError('Error calling enterGame API. Check network and server logs.')
    }
}

onMounted(() => { void enterSelectedGame() })
watch(() => normalizedQuery.value, () => { void enterSelectedGame() })
</script>
