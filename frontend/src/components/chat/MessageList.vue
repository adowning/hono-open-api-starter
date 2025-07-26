<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import ChatMessage from './ChatMessage.vue'; // Adjust path
import type { Message, User } from './types'; // Adjust path

gsap.registerPlugin(ScrollToPlugin);

// --- Props ---
const props = defineProps({
  messages: {
    type: Array as PropType<Message[]>,
    required: true,
  },
  users: {
    type: Object as PropType<Record<string, User>>,
    required: true
  }
});

// --- Refs ---
const messageListEl = ref<HTMLDivElement | null>(null);

// --- State ---
// Keep track of which messages have already been animated to prevent re-animating on re-renders.
const animatedMessageIds = new Set<string>();

// --- Logic ---
function isMessageAnimated(id: string): boolean {
    if(animatedMessageIds.has(id)){
        return false;
    }
    animatedMessageIds.add(id);
    return true;
}

// --- Watchers ---
watch(() => props.messages.length, () => {
  // When a new message is added, scroll to the bottom.
  gsap.to(messageListEl.value, {
    duration: 0.5,
    scrollTo: 'max',
    ease: 'power2.out',
    delay: 0.1,
  });
});
</script>

<template>
  <div ref="messageListEl" class="message-list flex-grow p-4 space-y-4 overflow-y-auto">
    <ChatMessage
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :user="users[message.userId]"
      :animate="isMessageAnimated(message.id)"
    >
        <!-- Special handling for the typing indicator -->
        <div v-if="message.id === 'typing-indicator'" class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </ChatMessage>
  </div>
</template>
<style scoped>
.message-list {
    /* Custom minimal scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #530080ff transparent;
}

.message-list::-webkit-scrollbar {
    width: 6px;
}
.message-list::-webkit-scrollbar-track {
    background: transparent;
}
.message-list::-webkit-scrollbar-thumb {
    background-color: #530080ff;
    border-radius: 6px;
    border: 2px solid transparent;
}

/* Typing Indicator Styles */
.typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0; /* Add some padding to match text height */
}
.typing-indicator .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #9ca3af;
    animation: bounce 1.2s infinite;
}
.typing-indicator .dot:nth-child(2) {
    animation-delay: 0.2s;
}
.typing-indicator .dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
}
</style>
