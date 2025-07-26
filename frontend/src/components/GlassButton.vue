<script lang="ts" setup>
import router from '@/router'

const props = defineProps(['to', 'type', 'w', 'text', 'shine', 'color', 'disabled', 'loading'])

function handleClick() {
  if (props.to) {
    router.push(props.to)
  }
}
const buttonStyle = ref()
if (props.w) {
  // buttonStyle.value = `min-width: ${props.w || 0}px; max-width: ${props.w || 0}px`
}
</script>

<template>
  <div v-if="!disabled && !loading" :id="type" class="button glass relative flex items-center justify-center text-lg"
    :class="color === 'blue' ? 'blueGlass' : color === 'red' ? 'redGlass' : 'greenGlass'" :style="buttonStyle"
    @click="handleClick">
    <div v-if="shine" class="shine-box" :style="`min-width: ${w}px`" />
    <!-- <img
      class="absolute top-0 bottom-0 left-0 right-0 z-0 w-full h-full object-"
    /> -->
    <!-- <div style="line-height: .5;padding-top: 10px; padding-bottom: 3px; padding-left: 10px; padding-right: 10px  ">
      {{ text }}
    </div> -->
    <!-- <slot class="primary-text" /> -->
    <div class="text-2xl flex baseFont">
      <slot />
    </div>
  </div>
  <div v-else>
    <div v-if="disabled" class="button glass greyGlass relative flex items-center justify-center text-lg">
      <div class="" :style="`min-width: ${w}px`">
        <slot class="primary-text" />
      </div>
    </div>
    <div v-if="loading" class="button glass relative flex items-center justify-center text-lg"
      :class="color === 'blue' ? 'blueGlass' : color === 'red' ? 'redGlass' : 'greenGlass'" :style="buttonStyle">
      <div class="" :style="`min-width: ${w}px`">
        <!-- <Loading /> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.primary-text {
  font-family: 'Broznier';
  font-size: 22px;
  font-weight: 400;
  color: white;
  /* -webkit-text-fill-color: transparent;
    -webkit-text-stroke-width: 0.4px;
    -webkit-text-stroke-color: #752eb3; */
  background: -webkit-linear-gradient(#ba4ff8, #c382fc);
  /* -webkit-background-clip: text; */
  /* background-clip: text; */
  /* -webkit-text-fill-color: #ffe; */
}

.honk {
  font-family: 'Broznier';
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings:
    'MORF' 15,
    'SHLN' 50;
}

.fira-code {
  font-family: 'Broznier';
  font-optical-sizing: auto;
  font-weight: 900;
  font-style: normal;
}

.glass {
  box-shadow: 0px 1px 10px -5px #510099;
  /* text-shadow: 0.5px -1px #510099; */
  /* background styles */
  position: relative;
  display: inline-block;
  padding: 3px 13px 5px 13px;
  /*for compatibility with older browsers*/
  /* text styles */
  font-weight: 900;
  padding-bottom: 0px;
  background-size: 100% 130%;
  border-bottom-right-radius: 0;
  background-color: white;
  font-size: 16px;
  border-bottom-right-radius: 13px;
  border-bottom-left-radius: 13px;
  border-top-left-radius: 13px;
  border-top-right-radius: 13px;
}

.glass.greenGlass {
  background-color: green;
  background-image: linear-gradient(green, lightgreen);
}

.glass.blueGlass {
  background-color: #1f1f8a;
  background-image: linear-gradient(#1f1f8a, #675df0);
}

.glass.greyGlass {
  background-color: #38383a;
  background-image: linear-gradient(#38383a, #908f9e);
}

.glass.redGlass {
  background-color: #8a1f54;
  background-image: linear-gradient(#f05d71, #8a1f48);
}

.shine-box {
  position: absolute;
  width: 100%;
  height: 97%;
  overflow: hidden;
  border-radius: 22px;
  transform: translate(0px, 0px);
}

.shine-box:before {
  position: absolute;
  left: -800px;
  content: '';
  width: 30%;
  height: 97%;
  background: rgba(255, 255, 255, 0.6);
  transform: skew(-50deg);
  /* transition: 1s;
	 */
  animation: shine 4s ease infinite;
}

@keyframes shine {
  from {
    left: -500px;
  }

  to {
    left: 655px;
  }
}

.glass:active {
  color: white;
  transform: translateY(0.2em);
}

.glass:after {
  border-radius: 6px;
  content: '';
  position: absolute;
  top: 2px;
  left: 4px;
  width: calc(100% - 8px);
  height: 40%;
  background: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.2));
}
</style>
