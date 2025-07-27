<script setup lang="ts">
import { storeToRefs } from 'pinia'; // Import storeToRefs
import { onMounted, reactive, ref } from 'vue'; // Import necessary Vue 3 APIs
import { useRouter } from 'vue-router'
import AuthPanel from './AuthPanel.vue'

const router = useRouter() // Router might still be needed for direct push in specific cases, but main auth nav is in App.vue
const authStore = useAuthStore()
const {
    isLoading: isAuthLoading, // Auth store's loading state
    isAuthenticated, // Auth store's authentication status
} = storeToRefs(authStore)
const formData = reactive({
    email: 'asdf@cashflow.com',
    password: 'asdfasdf',
    confirmPassword: 'asdfasdf', // For sign-up
    username: 'asdf', // For sign-up
})
const showError = ref<boolean>(false)

const handleLogin = async () => {
    await authStore.clearAuth()
    await authStore.login({
        username: formData.username,
        password: formData.password,
    })
}
// const handleSignIn = async () => {
//     if (!formData.username || !formData.password) {
//         console.log('error in')
//         notificationStore.addNotification('error', 'Please enter both email and password.')
//         return
//     }

//     const success = await signInWithPassword({
//         username: formData.username,
//         password: formData.password,
//     })
//     console.log(success)
//     if (success) {
//         // notificationStore.addNotification('info', error?.message || 'Sign in succeeded.')
//     } else {
//         showError.value = true
//         // notificationStore.addNotification('error', error?.message || 'Sign in failed.')
//         setTimeout(() => {
//             showError.value = false
//             // isAuthLoading.value = false // Use the store's loading state

//             // window.location.reload()
//         }, 2000)
//     }
// }

onMounted(() => {
    if (isAuthenticated.value) {
        console.log('Already authenticated, redirecting from LoginView.')
        // router.push({ name: 'home' }) // Assuming 'Home' is your main app route
    }
})
</script>
<template>
    <AuthPanel title="Login">
        <form class="flip-card__form text-white flex mx-4 px-4 mt-5 overflow-hidden" @submit.prevent="handleLogin">
            <input v-model="formData.username" type="username" placeholder="username" required class="flip-card__input"
                :disabled="isAuthLoading || showError" />
            <input v-model="formData.password" type="password" placeholder="Password" required
                autocomplete="current-password" class="flip-card__input" :disabled="isAuthLoading || showError" />
            <GlassButton type="submit" class="flip-card__btn mt-3" :disabled="isAuthLoading || showError"
                @click="handleLogin">
                Let's Go!
            </GlassButton>
        </form>

        <div class="flex flex-col">
            <div class="w-full flex justify-center glow">
                <div class="flex mt-12"></div>
            </div>
            <div id="googleSignInButtonContainer" class="google-signin-container flex mt-2 mx-3 px-3 justify-center">
            </div>
        </div>
    </AuthPanel>
    <!-- <div v-if="!isAuthLoading"> -->
    <!-- <Loading /> -->
    <!-- </div> -->
</template>
<style scoped>
input[type='checkbox'] {
    height: 0;
    width: 0;
    visibility: hidden;
}

label {
    cursor: pointer;
    text-indent: -9999px;
    width: 100px;
    height: 50px;
    background: #d19ae4;
    display: block;
    border-radius: 50px;
    position: relative;
}

label:after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 45px;
    height: 45px;
    background: #fff;
    border-radius: 90px;
    transition: 0.3s;
}

input:checked+label {
    background: #5b0091;
}

input:checked+label:after {
    left: calc(100% - 5px);
    transform: translateX(-100%);
}

label:active:after {
    width: 130px;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.login-view-container {
    width: 100%;
    height: 60%;
    /* Ensure it takes full viewport height */
    margin-top: 0;
    display: flex;
    /* Use flex to center content */
    flex-direction: column;
    justify-content: start;
    /* Vertically center */
    align-items: center;
    /* Horizontally center */
    /* background-image: url('/src/assets/login-bg.jpg'); */
    background-size: cover;
    /* Changed from contain for full coverage */
    background-position: center;
    /* Center the background */
    background-repeat: no-repeat;
    background-color: #021130;
    /* background-image: url('/images/starsbg.png'); */
    background-size: 120% 120%;
    background-origin: border-box;
    background-position: center;
    background-repeat: no-repeat;
    height: 100vh;
    padding: 20px;
    /* Add some padding for smaller screens */
    box-sizing: border-box;
}

.flip-card__inner {
    width: 320px;
    /* Take full width of its parent label */
    max-width: 420px;
    /* Max width for the form area */
    height: auto;
    /* Let content define height, was 350px */
    min-height: 380px;
    /* Ensure enough space for inputs */
    position: relative;
    background-color: transparent;
    perspective: 1000px;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    margin-top: 16px;
    position: relative;
    /* This should already be present */
    z-index: 0;
}

.flip-card__front,
.flip-card__back {
    box-sizing: border-box;
    /* Added for better padding control */
    width: 100%;

    justify-content: center;
    align-items: center;
    /* max-width: 420px; /* Let parent control max-width */
    padding: 20px;
    /* Unified padding */
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* Center form content */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background: var(--bg-color, #1f2937);
    /* Slightly lighter dark for card */
    gap: 15px;
    /* Adjusted gap */
    border-radius: 8px;
    /* Softer radius */
    border: 1px solid var(--main-color, #b954f3);
    /* Thinner border */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    /* Softer shadow */
}

.flip-card__back {
    transform: rotateY(180deg);
}

.flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    /* Adjusted gap */
    width: 100%;
    /* Form takes full width of card */
}

.title {
    margin-bottom: 15px;
    /* Adjusted margin */
    font-size: 24px;
    /* Slightly smaller */
    font-weight: 700;
    /* Adjusted weight */
    text-align: center;
    color: var(--font-color, #fefefe);
}

.flip-card__input {
    width: 100%;
    /* Full width inputs */
    /* max-width: 300px;  */
    height: 45px;
    /* Slightly taller */
    border-radius: 5px;
    border: 2px solid var(--main-color, #b954f3);
    background-color: var(--bg-color-input, #2c3748);
    /* Different input bg */
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
    /* Inset shadow */
    font-size: 16px;
    font-weight: 500;
    color: var(--font-color, #fefefe);
    padding: 5px 15px;
    /* More padding */
    outline: none;
    transition: border-color 0.3s;
}

.flip-card__input::placeholder {
    color: var(--font-color-sub, #7e7e7e);
    opacity: 0.8;
}

.flip-card__input:focus {
    border-color: var(--input-focus, #2d8cf0);
    /* Use border-color for focus */
}

.flip-card__btn {
    /* justify-content: center; */
    /* align-items: center; Center button text */
    /* min-width: 150px; Minimum width */
    padding: 8px 20px;
    font-size: 16px;
    /* height: 45px; */
    /* box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); Softer shadow */
}

.flip-card__btn:hover {
    background-color: darken(var(--main-color, #b954f3), 10%);
    /* Darken on hover */
}

.flip-card__btn:active {
    box-shadow: 0px 0px var(--main-color, #b954f3);
    transform: translate(2px, 2px);
    /* Slightly less movement */
}

.flip-card__btn:disabled {
    background-color: #555;
    border-color: #444;
    color: #888;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

.social-login-divider {
    margin: 15px 0;
    color: var(--font-color-sub, #7e7e7e);
    text-align: center;
    width: 100%;
}

.switch-visual-container {
    position: relative;
    width: var(--toggle-track-width);
    height: var(--toggle-track-height);
}

.switch-track {
    width: 100%;
    height: 100%;
    background-color: var(--track-bg-login);
    border-radius: calc(var(--toggle-track-height) / 2);
    /* Pill shape */
    transition: background-color var(--transition-duration) var(--transition-timing-function);
}

/* Change track background when sign up is active */
.auth-mode-toggle.is-signup-active .switch-track {
    background-color: var(--track-bg-signup);
}

.switch-knob {
    position: absolute;
    top: calc((var(--toggle-track-height) - var(--knob-size)) / 2);
    left: var(--track-internal-padding);
    width: var(--knob-size);
    height: var(--knob-size);
    background-color: var(--knob-bg-color);
    border-radius: 50%;
    /* Circular knob */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform var(--transition-duration) var(--transition-timing-function);
}

.auth-mode-toggle:focus-visible {
    box-shadow: 0 0 0 2px var(--focus-ring-color);
}

.lab {
    font-size: 18px;
    font-weight: 700;
    transition:
        color var(--transition-duration) var(--transition-timing-function),
        font-weight var(--transition-duration) var(--transition-timing-function);
}

.login-label {
    color: var(--text-color-inactive);
    font-weight: var(--label-font-weight-inactive);
}

.auth-mode-toggle .login-label.active {
    color: var(--text-color-active);
    font-weight: var(--label-font-weight-active);
}

.signup-label {
    color: var(--text-color-inactive);
    font-weight: var(--label-font-weight-inactive);
}

/* Move knob to the right when sign up is active */
.auth-mode-toggle.is-signup-active .switch-knob {
    transform: translateX(calc(var(--toggle-track-width) - var(--knob-size) - (2 * var(--track-internal-padding))));
}

/* CSS Variables for theming (optional, but good practice) */
:root {
    --input-focus: #4a90e2;
    /* Example: A lighter blue */
    --font-color: #e0e0e0;
    /* Light gray for text */
    --font-color-sub: #a0a0a0;
    /* Medium gray for subtext/placeholders */
    --bg-color: #1e2a3b;
    /* Dark blue-gray background */
    --bg-color-input: #2c3a4b;
    /* Slightly lighter for inputs */
    --main-color: #6c63ff;
    /* Example: A vibrant purple */
    --font-color-btn: #ffffff;
}
</style>
<!-- "{\"currentUser\":{\"id\":\"5fymmflp0ul7r9fq7ccre\",\"username\":\"asdf\",\"email\":null,\"accessToken\":null,\"refreshToken\":null,\"accessTokenExpiresAt\":null,\"refreshTokenExpiresAt\":null,\"currentGameSessionDataId\":null,\"currentAuthSessionDataId\":null,\"avatar\":\"avatar-1.webp\",\"role\":\"USER\",\"isActive\":true,\"lastLoginAt\":null,\"totalXpGained\":0,\"activeWalletId\":\"zcqztc8gzbs5lhevkv5m8\",\"vipInfoId\":\"u7l33tc15m7ut4av2wcw2\",\"createdAt\":\"2025-07-25T17:20:31.000Z\",\"updatedAt\":\"2025-07-25T17:20:31.000Z\",\"deletedAt\":null},\"accessToken\":\"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI1ZnltbWZscDB1bDdyOWZxN2NjcmUiLCJzZXNzaW9uSWQiOiJic2pzY3ZjdG9xOW9jZ2RwcnpncjUiLCJpYXQiOjE3NTM1NzQ4NDMsImV4cCI6MTc1NDE3OTY0M30.X2jgDrtVrGVX0AwPWX5OEc79E1tCibgNzAH0dmTYEfo\",\"refreshToken\":\"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI1ZnltbWZscDB1bDdyOWZxN2NjcmUiLCJzZXNzaW9uSWQiOiJic2pzY3ZjdG9xOW9jZ2RwcnpncjUiLCJpYXQiOjE3NTM1NzQ4NDMsImV4cCI6MTc1NDE3OTY0M30.X2jgDrtVrGVX0AwPWX5OEc79E1tCibgNzAH0dmTYEfo\",\"isLoading\":false,\"error\":null,\"isSignUpMode\":false}" -->
