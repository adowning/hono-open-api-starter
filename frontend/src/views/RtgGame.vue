<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
    <div v-if="!error && gameLaunchOptions" class="w-screen h-screen">
        <GameLoader :launch-options="gameLaunchOptions" />
    </div>
    <div v-else-if="error" class="text-white">
        <p>Failed to load game.</p>
    </div>
    <div v-else class="text-white">
        <p>Loading game...</p>
    </div>
</template>

<script setup lang="ts">
import GameLoader from '@/components/GameLoader.vue'
import { useGameStore } from '@/stores/game.store'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref, computed } from 'vue'

interface GameLaunchOptions {
    launch_url: string;
    launch_options: {
        game_launcher_url: string;
        [key: string]: unknown;
    };
}

const gameName = useRouteQuery('gameName')
const gameStore = useGameStore()
const error = ref(!gameName.value)
const gameLaunchOptions = ref<GameLaunchOptions | null>(null)

const game = computed(() =>
    gameStore.games.find((g) => g.name === gameName.value)
)

onMounted(async () => {
    if (gameStore.games.length === 0) {
        await gameStore.fetchAllGames()
    }

    if (game.value) {
        try {
            const response = await gameStore.enterGame(game.value.id)
            if (response) {
                gameLaunchOptions.value = {
                    launch_url: response.webUrl,
                    launch_options: {
                        game_launcher_url: response.webUrl,
                        ...response.gameConfig,
                    },
                }
            }
        } catch (e) {
            console.error('Failed to enter game', e)
            error.value = true
        }
    } else {
        // Handle case where game is not found
        console.error(`Game with name ${gameName.value} not found.`)
        error.value = true
    }
})
</script>
