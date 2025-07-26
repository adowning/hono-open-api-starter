<script lang="ts" setup>
import { useEventManager } from '@/composables/EventManager'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const eventBus = useEventManager()
const router = useRouter()

const props = defineProps({
  hasCancel: Boolean,
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
})
const emit = defineEmits(['update:modelValue'])
function logout() {
  const authStore = useAuthStore()
  authStore.logout()
}
// const isOpen = ref(false)
const customElementsForm = reactive({
  checkbox: ['lorem'],
  radio: 'one',
  switch: ['one', 'two', 'three'],
  file: null,
})
const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function gotoAgent() {
  eventBus.emit('settingsModal', false)
  router.replace('/agent')
  // window.location.reload()
}
function cancel() {
  eventBus.emit('settingsModal', false)
  router.replace('/')
  // window.location.reload()
}
// function logOutz() {
//   // console.log('logging out..')
//   logout()
// }
</script>

<template>
  <OverlayLayer v-show="value" @overlay-click="cancel">
    <div v-show="value" class="flex-col relative max-h-modal w-11/12 md:w-3/5 lg:w-2/5 xl:w-4/12 z-50" style="
        background-repeat: no-repeat;
        margin: auto;
        border-image: url('/images/common/cell-2.png') 30 30 30 30 fill / 30px 30px 30px 30px;
        padding: 30px 30px 30px 30px;
      ">
      <!-- <div
        class="futex-cell-3 pb-0 flex pa-[4px] gap-2 flex-col m-8 my-12 justify-center items-center"
        style="
          padding: 8px;
          padding-top: 32px;
          padding-bottom: 3px;
          margin-left: 10px;
          margin-right: 12px;
        "
      > -->
      <div class="absolute right-0 gap-2" style="top: -0px; right: -0px" @click="eventBus.emit('settingsModal', false)">
        <CloseButton width="40" height="40" idle-image="/images/common/close.png"
          pressed-image="/images/common/close-pressed.png" />
      </div>
      <div class="flex justify-end pb-3 w-full px-4 text-white font-bold">version: 1.08</div>
      <div class="flex justify-between w-full glow px-4 gap-2 pb-1">
        Full Screen
        <FormCheckRadioGroup v-model="customElementsForm.switch" name="sample-switch" type="switch"
          :options="{ one: '' }" />
        <!-- <MazSwitch size="large" color="success" /> -->
      </div>
      <div class="flex justify-between w-full glow px-4 pb-1">
        Sound Effects
        <FormCheckRadioGroup v-model="customElementsForm.switch" name="sample-switch" type="switch"
          :options="{ two: '' }" />
        <!-- <MazSwitch /> -->
      </div>
      <div class="flex justify-between w-full glow px-4 pb-1">
        Music
        <FormCheckRadioGroup v-model="customElementsForm.switch" name="sample-switch" type="switch"
          :options="{ three: '' }" />
        <!-- <MazSwitch color="primary" /> -->
      </div>
      <div />
      <div class="flex justify-around items-center w-full glow px-4"
        style="margin-top: 30px; margin-bottom: 0px; padding-bottom: 0px">
        <GlassButton color="red" :shine="false" @click="logout"> LOG OUT </GlassButton>

        <GlassButton :shine="false" @click="gotoAgent"> AGENT </GlassButton>
      </div>
    </div>
    <!-- <div class="flex my-12 h-[80px]" /> -->
  </OverlayLayer>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
