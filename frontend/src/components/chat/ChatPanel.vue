<template>
  <div id="morph-container" ref="morphContainer" @click="openChat">
    <div id="neon-box" ref="neonBox" class="text-white pl-7.5 pt-7 border-white zIndex-1">
      <!-- <img v-if="!isExpanded" src="../../assets/flamelogo60x60.png" alt="Chat Logo"
        style="width: 90%; height: 90%; object-fit: cover; position: absolute" /> -->
      <!-- <VGSprite id="logoShine" class="flex" image-src="/images/bottom/logo_shine_trans.png"
        :sprite-sheet-data="LogoJson" style="position: absolute; transform: scale(0.9); z-index: -1" :speed="60"
        :delay="6000" :offset="5000" :autoplay="true" /> -->
      <SpriteAnimator :animation-data="LogoJson" image-url="/images/bottom/logo_shine_trans.png" :width="80"
        :height="80" :frame-count="LogoJson.frames.length" :initial-delay-max="8" :loop-delay="7" />
      <!--background-repeat: no-repeat; z-index: 10; margin-top: -200px; padding-top: 30px; margin-right: -27px; transform: scale(0.6) translateY(55px)-->
      <!-- Close Button -->
      <div id="close-chat" @click.stop="closeChat">
        <img id="close-chat-img" :src="closeImgSrc" alt="Close Chat" @mouseover="closeImgSrc = closePressedImgSrc"
          @mouseout="closeImgSrc = closeDefaultImgSrc" @mousedown="closeImgSrc = closePressedImgSrc"
          @mouseup="closeImgSrc = closeDefaultImgSrc" />
      </div>

      <!-- The Actual Chat UI -->
      <div id="chat-ui" ref="chatUI" class="w-full h-full flex flex-col opacity-0 invisible">
        <MessageList :messages="currentMessages" :users="users" />
        <form id="chat-form" class="p-3 flex items-center space-x-2 border-t border-purple-500/20"
          @submit.prevent="handleSendMessage">
          <input type="text" v-model="newMessageText" placeholder="Type a message..."
            class="flex-grow bg-transparent text-white focus:outline-none" />
          <button type="submit" class="text-purple-400 hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
<script setup lang="ts">
import LogoJson from '@/assets/anim/logo_shine.json'
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import MessageList from './ChatMessageList.vue' // Adjust path
import { useChatStore } from '@/stores/chat.store' // Import the chat store

const chatStore = useChatStore()
const isExpanded = ref(false)

interface User {
  name: string
  avatar: string
  online: boolean
}
interface Message {
  id: string
  userId: string
  text: string
  time: string
}

gsap.registerPlugin(Flip)

// --- Refs for DOM Elements ---
const morphContainer = ref<HTMLDivElement | null>(null)
const neonBox = ref<HTMLDivElement | null>(null)
const chatUI = ref<HTMLDivElement | null>(null)

// --- Component State ---
const isChatOpen = ref(false)
const currentMessages = ref<Message[]>([])
const newMessageText = ref('')
const shadowColors = ['#7206b5dd', '#530080dd']
let pulseInterval: number | null = null

// --- Close Button Image State ---
const closeDefaultImgSrc = 'https://images.cashflowcasino.com/misc/close.png'
const closePressedImgSrc = 'https://images.cashflowcasino.com/misc/close-pressed.png'
const closeImgSrc = ref(closeDefaultImgSrc)

// --- Static Data ---
const users: Record<string, User> = {
  'user-you': { name: 'You', avatar: '/images/avatars/avatar-1.webp', online: true },
  'user-alex': { name: 'Alex', avatar: '/images/avatars/avatar-2.webp', online: true },
  'user-sam': { name: 'Sam', avatar: '/images/avatars/avatar-3.webp', online: false },
  'user-jess': { name: 'Jess', avatar: '/images/avatars/avatar-4.webp', online: true }
}

const initialMessages: Omit<Message, 'id'>[] = [
  { userId: 'user-alex', text: "Hey, how's the project going?", time: '10:30 PM' },
  {
    userId: 'user-you',
    text: "It's going well! Just putting the final touches on the animation.",
    time: '10:31 PM'
  },
  {
    userId: 'user-sam',
    text: 'Glad to hear it! The new online status indicators look great.',
    time: '10:32 PM'
  },
  {
    userId: 'user-jess',
    text: 'I agree! The minimal scrollbar is a nice touch too.',
    time: '10:32 PM'
  }
]

// --- Methods ---
const startPulsing = () => {
  if (pulseInterval) return
  pulseInterval = window.setInterval(() => {
    gsap.to(neonBox.value, {
      '--shadow-color': gsap.utils.random(shadowColors),
      duration: 1.5,
      ease: 'power1.inOut'
    })
  }, 1500)
}

const stopPulsing = () => {
  if (pulseInterval) clearInterval(pulseInterval)
  pulseInterval = null
  gsap.to(neonBox.value, { '--shadow-color': shadowColors[0], duration: 0.5 })
}
const openChat = () => {
  if (isExpanded.value) return
  // ... your existing open animation logic ...
  isExpanded.value = true
  chatStore.setChatOpenState(true) // Update store
  if (isChatOpen.value || !morphContainer.value) return

  const state = Flip.getState(morphContainer.value)
  morphContainer.value.classList.add('is-expanded')

  Flip.from(state, {
    duration: 0.8,
    ease: 'expo.inOut',
    onComplete: () => {
      gsap.to(chatUI.value, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        delay: 0.3,
        onComplete: () => {
          // Load initial messages after UI is visible
          initialMessages.forEach((msg, index) => {
            gsap.delayedCall(index * 0.15, () => {
              addMessage(msg.text, msg.userId, msg.time)
            })
          })
        }
      })
      startPulsing()
    }
  })
  isChatOpen.value = true
}

const closeChat = () => {
  if (!isExpanded.value) return
  // ... your existing close animation logic ...
  isExpanded.value = false
  chatStore.setChatOpenState(false) // Update store
  if (!isChatOpen.value || !morphContainer.value) return

  const state = Flip.getState(morphContainer.value)

  gsap.to(chatUI.value, {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.3,
    onComplete: () => {
      morphContainer.value?.classList.remove('is-expanded')
      currentMessages.value = [] // Clear messages on close
      Flip.from(state, {
        duration: 0.8,
        ease: 'expo.inOut'
      })
    }
  })
  stopPulsing()
  isChatOpen.value = false
}

const addMessage = (text: string, userId: string, time?: string) => {
  const message: Message = {
    id: crypto.randomUUID(),
    userId,
    text,
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  currentMessages.value.push(message)
}

const handleSendMessage = () => {
  const text = newMessageText.value.trim()
  if (text) {
    addMessage(text, 'user-you')
    newMessageText.value = ''
    simulateReply()
  }
}

const simulateReply = () => {
  const randomResponderId = Object.keys(users).filter((id) => id !== 'user-you')[Math.floor(Math.random() * 3)]
  setTimeout(() => {
    // Show typing indicator
    const typingMessage: Message = {
      id: 'typing-indicator',
      userId: randomResponderId,
      text: '...',
      time: ''
    }
    currentMessages.value.push(typingMessage)

    setTimeout(() => {
      // Remove typing indicator
      currentMessages.value = currentMessages.value.filter((m: any) => m.id !== 'typing-indicator')
      // Add actual reply
      addMessage("That's an interesting point!", randomResponderId)
    }, 2000)
  }, 800)
}

// --- Lifecycle Hooks ---
onMounted(() => {
  gsap.set(neonBox.value, { '--shadow-color': shadowColors[0] })
})
</script>

<style scoped>
/* All the global styles from the original HTML file are relevant here */
/* .phone-screen { position: relative; overflow: hidden; width: 100%; height: 100%; } */
#morph-container {
  z-index: 1;
  /* position: absolute; */
  bottom: 1.5rem;
  right: 0.4rem;
  width: 4rem;
  height: 4rem;
  cursor: pointer;
  will-change: transform;
}

#neon-box {
  z-index: 99;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  box-shadow: 0 0 15px 5px var(--shadow-color);
  background-color: #080b2a;
  border: 2px solid white;
  position: relative;
}

#morph-container.is-expanded {
  top: 1.5rem !important;
  left: 1.5rem !important;
  bottom: 1.5rem !important;
  right: 1.5rem !important;
  width: auto !important;
  height: auto !important;
  cursor: default;
}

#morph-container.is-expanded #neon-box {
  border-radius: 1rem;
  border-width: 0.5px;
}

#close-chat {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 1.75rem;
  height: 1.75rem;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s,
    visibility 0.3s;
  z-index: 999;
}

#close-chat img {
  width: 100%;
  height: 100%;
}

#morph-container.is-expanded #close-chat {
  opacity: 1;
  visibility: visible;
  transition-delay: 0.5s;
}
</style>
