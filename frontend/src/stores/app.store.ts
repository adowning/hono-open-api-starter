import { defineStore } from 'pinia'


export const useAppStore = defineStore('app', () => {
    const globalLoading = ref(false)

    function showLoading() {
        // console.log('showLoading called - stack:', new Error().stack)
        globalLoading.value = true
        // production: removed debug logs
    }

    function hideLoading() {
        globalLoading.value = false
        // production: removed debug logs
    }

    // removed debug helper for production

    return {
        globalLoading,
        showLoading,
        hideLoading,
    }
})
