<!-- src/components/GameHost.vue -->
<template>
  <div ref="gameContainer" class="game-host-container bg-blue">
    <!-- 
      The GameLauncher will inject both the loading indicator and the iframe here.
      No extra template code is needed for the loader.
    -->
  </div>
</template>

<style scoped>
.game-host-container {
  width: 100%;
  height: 800px; 
  overflow: hidden;
  z-index: 9990;
}
</style>

<script setup lang="ts">
// Note the 'lang="ts"' for TypeScript support in Vue SFCs
import { ref, onMounted, onUnmounted, defineProps, defineEmits, defineExpose } from 'vue';
import GameLauncher from '../services/GameLauncher'; // .ts extension is omitted in imports

// --- Type Definitions for Props and Emits ---
interface Props {
  launchOptions: {
    // Define a more specific type for your launch options
    gameConfig?: {
      authToken?: string;
      gameSessionId?: string;
      userId?: string;
      [key: string]: string | number | boolean | undefined;
    };
    [key: string]: unknown;
  };
}

// --- Props and Emits ---
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'messageFromGame', data: Record<string, unknown>): void;
}>();

// --- State ---
const gameContainer = ref<HTMLElement | null>(null);
let launcher: GameLauncher | null = null; // Store the launcher instance

// --- Methods ---
function handleMessageFromGame(data: Record<string, unknown>) {
  console.log('Message received from iframe:', data);

  // *** NEW LOGIC: HANDSHAKE ***
  // When the loader is ready, send the auth token back to it.
  if (data.type === 'RTG_LOADER_READY') {
    const gameConfig = props.launchOptions.gameConfig;
    if (launcher && gameConfig) {
      const authPayload = {
        type: 'SET_AUTH_TOKEN',
        token: gameConfig.authToken,
        gameSessionId: gameConfig.gameSessionId,
        userId: gameConfig.userId,
      };
      console.log('Sending SET_AUTH_TOKEN to iframe:', authPayload);
      launcher.sendMessage(authPayload);
    } else {
      console.error('GameHost: Launcher not initialized or gameConfig missing in launchOptions.');
    }
  }

  // Emit all other messages to the parent component
  emit('messageFromGame', data);
}

// --- Lifecycle Hooks ---
onMounted(() => {
  if (gameContainer.value) {
    launcher = new GameLauncher(gameContainer.value, {
      onMessage: handleMessageFromGame,
    });

    // Ensure we send SET_AUTH_TOKEN regardless of loader ready timing.
    // 1) Proactively send INIT_GAME immediately (contains authToken via props.launchOptions.launch_options)
    try {
      const cfg = (props.launchOptions as any)?.launch_options ?? {}
      if (launcher && Object.keys(cfg).length > 0) {
        launcher.sendMessage({
          type: 'INIT_GAME',
          config: cfg,
        })
      }
    } catch (e) {
      console.warn('[GameLoader] proactive INIT_GAME send failed', e)
    }

    // 2) Also attach a short-lived retry to send SET_AUTH_TOKEN after a brief delay,
    // in case loader did not yet finish initializing postMessage listeners.
    try {
      const cfg = (props.launchOptions as any)?.launch_options ?? {}
      const payload = cfg?.authToken || cfg?.token ? {
        type: 'SET_AUTH_TOKEN',
        token: cfg.authToken ?? cfg.token,
        gameSessionId: cfg.gameSessionId,
        userId: cfg.userId,
      } : null

      if (payload && launcher) {
        // send once after 200ms
        setTimeout(() => {
          try { launcher?.sendMessage(payload) } catch {}
        }, 200)
        // send again after 1000ms as a backup
        setTimeout(() => {
          try { launcher?.sendMessage(payload) } catch {}
        }, 1000)
      }
    } catch (e) {
      console.warn('[GameLoader] proactive SET_AUTH_TOKEN send failed', e)
    }

    launcher.launch(props.launchOptions);
  }
});

onUnmounted(() => {
  if (launcher) {
    launcher.destroy();
  }
});

// Expose the sendMessage method so the parent component can call it
defineExpose({
  sendMessage: (message: Record<string, unknown>) => {
    launcher?.sendMessage(message);
  },
});
</script>
