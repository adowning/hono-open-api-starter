<template>
  <div ref="messageRoot" class="message" :class="messageType === 'sent' ? 'message-sent' : 'message-received'">
    <!-- Avatar & Status -->
    <div class="avatar-container">
      <img :src="user.avatar" class="avatar" alt="User Avatar" />
      <div v-if="messageType === 'received'" class="status-indicator"
        :class="user.online ? 'status-online' : 'status-offline'"></div>
    </div>

    <!-- Message Content -->
    <div class="message-content">
      <div class="message-header">
        <div class="message-name">{{ user.name }}</div>
        <div class="message-time">{{ message.time }}</div>
      </div>
      <div class="message-bubble">
        <slot>
          {{ message.text }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type PropType } from 'vue';
import { gsap } from 'gsap';
import type { Message, User } from './types'; // Adjust path as needed

// --- Props ---
const props = defineProps({
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  // Controls if the message should animate on creation
  animate: {
    type: Boolean,
    default: true
  }
});

// --- Refs ---
const messageRoot = ref<HTMLDivElement | null>(null);

// --- Computed Properties ---
const messageType = computed(() => (props.user.name === 'You' ? 'sent' : 'received'));

// --- Lifecycle Hooks ---
onMounted(() => {
  // Animate the message into view when the component is mounted
  if (messageRoot.value && props.animate) {
    gsap.set(messageRoot.value, { opacity: 0, y: 50, scale: 0.9 });
    gsap.to(messageRoot.value, {
      duration: 0.5,
      opacity: 1,
      y: 0,
      scale: 1,
      ease: 'power2.out',
    });
  } else if (messageRoot.value) {
    // For initial messages, just make them visible without animation
    gsap.set(messageRoot.value, { opacity: 1 });
  }
});
</script>

<style scoped>
/* Scoped styles are the same as the global ones from the original HTML file. */
/* They are included here for component encapsulation. */
.message {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
}

.message-content {
  display: grid;
  max-width: calc(100% - 3rem);
  font-size: 1rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.15rem;
  margin-bottom: 0.20rem;
}

.message-name {
  font-size: 0.75rem;
  color: #d1d5db;
  font-weight: 500;
}

.message-time {
  font-size: 0.65rem;
  color: #9ca3af;
}

.message-bubble {
  padding: 0.4rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
}

.avatar-container {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 9999px;
  border: 2px solid #160025;
}

.status-online {
  background-color: #22c55e;
}

.status-offline {
  background-color: #6b7280;
}

.message-sent {
  flex-direction: row-reverse;
}

.message-sent .message-content {
  align-items: flex-end;
}

.message-sent .message-bubble {
  background-color: #3b82f6;
  border-bottom-right-radius: 0.25rem;
}

.message-sent .status-indicator {
  display: none;
}

.message-received .message-content {
  align-items: flex-start;
}

.message-received .message-bubble {
  background-color: #4b5563;
  border-bottom-left-radius: 0.25rem;
}

/* The animation is handled by GSAP, so no keyframes are needed here. */
</style>