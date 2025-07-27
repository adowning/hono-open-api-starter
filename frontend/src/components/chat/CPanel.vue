<template>
        <div id="morph-container" ref="morphContainer" @click="openChat">
          <div id="neon-box" ref="neonBox" class="text-white border-white">
            
            <!-- Close Button -->
            <div id="close-chat" @click.stop="closeChat">
              <img id="close-chat-img" :src="closeImgSrc" alt="Close Chat" 
                   @mouseover="closeImgSrc = closePressedImgSrc"
                   @mouseout="closeImgSrc = closeDefaultImgSrc"
                   @mousedown="closeImgSrc = closePressedImgSrc"
                   @mouseup="closeImgSrc = closeDefaultImgSrc"
              />
            </div>
            
            <!-- The Actual Chat UI -->
            <div id="chat-ui" ref="chatUI" class="w-full h-full flex flex-col opacity-0 invisible">
              <MessageList :messages="currentMessages" :users="users" />
              <form id="chat-form" class="p-3 flex items-center space-x-2 border-t border-purple-500/20" @submit.prevent="handleSendMessage">
                <input type="text" v-model="newMessageText" placeholder="Type a message..." class="flex-grow bg-transparent text-white focus:outline-none">
                <button type="submit" class="text-purple-400 hover:text-purple-300 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </form>
            </div>
            
          </div>
        </div>
  

</template>
<style scoped></style>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import MessageList from "./ChatMessageList.vue"; // Adjust path
 interface User {
  name: string;
  avatar: string;
  online: boolean;
}
interface Message {
  id: string;
  userId: string;
  text: string;
  time: string;
}

gsap.registerPlugin(Flip);

// --- Refs for DOM Elements ---
const morphContainer = ref<HTMLDivElement | null>(null);
const neonBox = ref<HTMLDivElement | null>(null);
const chatUI = ref<HTMLDivElement | null>(null);

// --- Component State ---
const isChatOpen = ref(false);
const currentMessages = ref<Message[]>([]);
const newMessageText = ref("");
const shadowColors = ["#7206b5dd", "#530080dd"];
let pulseInterval: number | null = null;

// --- Close Button Image State ---
const closeDefaultImgSrc = "https://images.cashflowcasino.com/misc/close.png";
const closePressedImgSrc = "https://images.cashflowcasino.com/misc/close-pressed.png";
const closeImgSrc = ref(closeDefaultImgSrc);

// --- Static Data ---
const users: Record<string, User> = {
  "user-you": { name: "You", avatar: "/images/avatars/avatar-1.png", online: true },
  "user-alex": { name: "Alex", avatar: "/images/avatars/avatar-2.png", online: true },
  "user-sam": { name: "Sam", avatar: "/images/avatars/avatar-3.png", online: false },
  "user-jess": { name: "Jess", avatar: "/images/avatars/avatar-4.png", online: true },
};

const initialMessages: Omit<Message, "id">[] = [
  { userId: "user-alex", text: "Hey, how's the project going?", time: "10:30 PM" },
  {
    userId: "user-you",
    text: "It's going well! Just putting the final touches on the animation.",
    time: "10:31 PM",
  },
  {
    userId: "user-sam",
    text: "Glad to hear it! The new online status indicators look great.",
    time: "10:32 PM",
  },
  {
    userId: "user-jess",
    text: "I agree! The minimal scrollbar is a nice touch too.",
    time: "10:32 PM",
  },
];

// --- Methods ---
const startPulsing = () => {
  if (pulseInterval) return;
  pulseInterval = window.setInterval(() => {
    gsap.to(neonBox.value, {
      "--shadow-color": gsap.utils.random(shadowColors),
      duration: 1.5,
      ease: "power1.inOut",
    });
  }, 1500);
};

const stopPulsing = () => {
  if (pulseInterval) clearInterval(pulseInterval);
  pulseInterval = null;
  gsap.to(neonBox.value, { "--shadow-color": shadowColors[0], duration: 0.5 });
};
const openChat = () => {
  if (isChatOpen.value || !morphContainer.value) return;

  const state = Flip.getState(morphContainer.value);
  morphContainer.value.classList.add("is-expanded");

  Flip.from(state, {
    duration: 0.8,
    ease: "expo.inOut",
    onComplete: () => {
      gsap.to(chatUI.value, {
        opacity: 1,
        visibility: "visible",
        duration: 0.5,
        delay: 0.3,
        onComplete: () => {
          // Load initial messages after UI is visible
          initialMessages.forEach((msg, index) => {
            gsap.delayedCall(index * 0.15, () => {
              addMessage(msg.text, msg.userId, msg.time);
            });
          });
        },
      });
      startPulsing();
    },
  });
  isChatOpen.value = true;
};

const closeChat = () => {
  if (!isChatOpen.value || !morphContainer.value) return;

  const state = Flip.getState(morphContainer.value);

gsap.to(chatUI.value, {
    opacity: 0,
    visibility: "hidden",
    duration: 0.3,
    onComplete: () => {
    morphContainer.value?.classList.remove("is-expanded");
      currentMessages.value = []; // Clear messages on close
    Flip.from(state, {
        duration: 0.8,
        ease: "expo.inOut",
    });
    },
});
stopPulsing();
isChatOpen.value = false;
};

const addMessage = (text: string, userId: string, time?: string) => {
  const message: Message = {
    id: crypto.randomUUID(),
    userId,
    text,
    time:
      time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  currentMessages.value.push(message);
};

const handleSendMessage = () => {
  const text = newMessageText.value.trim();
  if (text) {
    addMessage(text, "user-you");
    newMessageText.value = "";
    simulateReply();
  }
};

const simulateReply = () => {
  const randomResponderId = Object.keys(users).filter((id) => id !== "user-you")[
    Math.floor(Math.random() * 3)
  ];
  setTimeout(() => {
    // Show typing indicator
    const typingMessage: Message = {
      id: "typing-indicator",
      userId: randomResponderId,
      text: "...",
      time: "",
    };
    currentMessages.value.push(typingMessage);

    setTimeout(() => {
      // Remove typing indicator
      currentMessages.value = currentMessages.value.filter(
        (m: Message) => m.id !== "typing-indicator"
      );
      // Add actual reply
      addMessage("That's an interesting point!", randomResponderId);
    }, 2000);
  }, 800);
};

// --- Lifecycle Hooks ---
onMounted(() => {
  gsap.set(neonBox.value, { "--shadow-color": shadowColors[0] });
});
</script>
