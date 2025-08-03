<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import Logo from '@/components/Logo.vue'
import { useAppStore } from '@/stores/app.store'
import { useAuthStore } from '@/stores/auth.store'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const appStore = useAppStore()

const {
  isSignUpMode,
  isLoading: isAuthLoading, // Auth store's loading state
  isAuthenticated,
} = storeToRefs(authStore)

// Ensure we navigate away if already authenticated (e.g., after successful login)
onMounted(() => {
  appStore.hideLoading()
  // Do NOT clear auth here; this caused post-login logout loops
  if (authStore.isSignUpMode === true) {
    authStore.toggleSignUpMode()
  }
  if (isAuthenticated.value) {

    console.debug('[login-view] already authenticated on mount, redirecting to /')
    // Push home using router import to avoid circular import issues at top-level
    import('@/router').then((m) => {
      m.default.push('/')
    })
  }
})
</script>
<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative">
    <div v-if="!isAuthLoading && !isAuthenticated">
      <div class="login-view-container overflow-hidden">
        <Logo class="logo-main"></Logo>
        <div class="flex mt-4 justify-center items-center min-h-[20px] w-80 glow text-sm zIndex-1">
          <div :style="`color: ${!isSignUpMode ? 'white' : 'green'};`">Login</div>

          <input type="checkbox" id="switch" style="transform: scale(0.5)" @click="authStore.toggleSignUpMode" /><label
            style="transform: scale(0.5)" for="switch">Toggle</label>

          <div :style="`color: ${isSignUpMode ? 'white' : 'green'};`">Signup</div>
        </div>
        <RegisterForm v-if="isSignUpMode" class="zIndex-1" />
        <LoginForm v-else class="zIndex-1" />
      </div>
    </div>

    <div v-else class="text-white text-center">
      Loading authentication...
    </div>
  </div>

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

.auth-mode-toggle {
  /* CSS Variables for easy theming and consistent sizing */
  --toggle-track-width: 50px;
  --toggle-track-height: 26px;
  --knob-size: 20px;
  /* Horizontal padding within the track for the knob */
  --track-internal-padding: 3px;

  /* Colors */
  --track-bg-login: #b954f3;
  /* Tailwind gray-400 */
  --track-bg-signup: #4a90e2;
  /* Tailwind blue-400 */
  --knob-bg-color: white;
  --text-color-inactive: #718096;
  /* Tailwind gray-600 */
  --text-color-active: #b954f3;
  /* Tailwind gray-800 */
  --label-font-weight-inactive: 400;
  --label-font-weight-active: 600;
  --focus-ring-color: #b954f3;
  /* Blue-400 for focus outline */

  /* Transitions */
  --transition-duration: 0.3s;
  --transition-timing-function: ease-in-out;
  margin-bottom: 20px;
  height: 50px;
  display: inline-flex;
  /* Use inline-flex to allow other elements on the same line */
  align-items: center;
  gap: 8px;
  /* Space between labels and the switch visual */
  cursor: pointer;
  user-select: none;
  /* Prevents text selection when clicking */
  padding: 4px;
  /* Padding for focus ring visibility */
  border-radius: 18px;
  /* Rounded corners for the entire component for focus */
  outline: none;
  /* Remove default outline, we'll add a custom one */
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

.auth-mode-toggle .signup-label.active {
  color: var(--text-color-active);
  font-weight: var(--label-font-weight-active);
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

/* Move knob to the right when sign up is active */
.auth-mode-toggle.is-signup-active .switch-knob {
  transform: translateX(calc(var(--toggle-track-width) - var(--knob-size) - (2 * var(--track-internal-padding))));
}

/* Scoped styles specific to LoginView */
.login-view-container {
  width: 100%;
  min-height: 100%;
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
  /* Ensure path is correct if used */
  background-size: cover;
  /* Changed from contain for full coverage */
  background-position: center;
  /* Center the background */
  background-repeat: no-repeat;
  background-color: #021130;
  background-image: url('/images/starsbg.png');
  background-size: 120% 120%;
  background-origin: border-box;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  padding: 20px;
  /* Add some padding for smaller screens */
  box-sizing: border-box;
}

.wrapper {
  /* Removed height: 100vh and width: 80vw to let content size itself within login-view-container */
  /* max-width: 520px; Already handled by parent */
  width: 100%;
  /* Take full width of the centered container */
  /* margin: auto; */
  display: flex;
  flex-direction: column;
  justify-content: start;
  /* Center flip card vertically if space allows */
  align-items: center;
  color: white;
  /* Assuming default text color is white based on original */
}

.logo-main {
  width: 70%;
  /* margin-top: 2rem; Vuetify mt-8 is usually 2rem */
  /* margin-bottom: 2rem; Add some space below logo */
}

.auth-error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: red;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  border: 1px solid red;
  text-align: center;
  width: 100%;
  max-width: 420px;
  /* Match form width */
}

.loading-indicator {
  color: #fff;
  margin-bottom: 15px;
}

/* Flip card styles from the original component */
.switch {
  transform: translateY(0);
  /* Adjusted from -200px, let flexbox handle positioning */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  width: 50px;
  height: 20px;
  margin-top: 2rem;
  /* Add some margin above the switch */
  margin-bottom: 2rem;
}

.card-side::before {
  position: absolute;
  content: 'Log in';
  left: -70px;
  top: 0;
  width: 200px;
  text-decoration: underline;
  color: var(--font-color, #fefefe);
  /* Added fallback */
  font-weight: 600;
  /* content: "Log in"; ... etc. */
  z-index: 1;
  /* Above the card, below the slider */
}

.card-side::after {
  position: absolute;
  content: 'Sign up';
  left: 70px;
  top: 0;
  width: 200px;
  text-decoration: none;
  color: var(--font-color, #fefefe);
  /* Added fallback */
  font-weight: 600;
  position: absolute;
  /* content: "Sign up"; ... etc. */
  z-index: 1;
  /* Above the card, below the slider */
}

.toggle {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  box-sizing: border-box;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  box-shadow: 4px 4px var(--main-color);
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-color);
  transition: 0.3s;
  position: absolute;
  /* cursor: pointer; ... etc. */
  z-index: 2;
  /* Ensure slider is on top for interaction and visibility */
}

.slider:before {
  box-sizing: border-box;
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  border: 2px solid var(--main-color);
  border-radius: 5px;
  left: -2px;
  bottom: 2px;
  background-color: var(--bg-color);
  box-shadow: 0 3px 0 var(--main-color);
  transition: 0.3s;
}

.toggle:checked+.slider {
  background-color: var(--input-focus);
}

.toggle:checked+.slider:before {
  transform: translateX(30px);
}

.toggle:checked~.card-side:before {
  text-decoration: none;
}

.toggle:checked~.card-side:after {
  text-decoration: underline;
}

/* Logic for toggle moved to JS for direct style manipulation for simplicity */
/* .toggle:checked + .slider { background-color: var(--input-focus, #2d8cf0); } */
/* .toggle:checked + .slider:before { transform: translateX(30px); } */
/* .toggle:checked ~ .card-side:before { text-decoration: none; } */
/* .toggle:checked ~ .card-side:after { text-decoration: underline; } */

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
  margin-top: 15px;
  /* Adjusted margin */
  width: auto;
  /* Let content define width */
  min-width: 150px;
  /* Minimum width */
  padding: 10px 20px;
  /* Padding for button */
  height: 45px;
  border-radius: 5px;
  border: 2px solid var(--main-color, #b954f3);
  background-color: var(--main-color, #b954f3);
  /* Button bg same as border */
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  /* Softer shadow */
  font-size: 16px;
  font-weight: 600;
  color: var(--font-color-btn, #fefefe);
  /* Ensure button text color is set */
  cursor: pointer;
  transition:
    background-color 0.3s,
    box-shadow 0.3s,
    transform 0.1s;
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

.google-signin-container {
  /* display: flex;
    min-width: 100%;
    min-height: 60px;
    justify-content: center;
    align-items: center; */
  /* width: 100%;
    height: 40%; */
  /* margin-top: 10px; */
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
