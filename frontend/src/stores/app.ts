import { defineStore } from 'pinia'

let instanceCount = 0

export const useAppStore = defineStore('app', () => {
    const globalLoading = ref(false)
    instanceCount++
    console.log(`App store instance created. Total instances: ${instanceCount}`)

    function showLoading() {
        // console.log('showLoading called - stack:', new Error().stack)
        globalLoading.value = true
    }

    function hideLoading() {
        // console.log('hideLoading called - stack:', new Error().stack)
        globalLoading.value = false
    }

    // Add a debug method
    function debugLoadingState() {
        console.log('Current loading state:', {
            globalLoading: globalLoading.value,
            timestamp: new Date().toISOString(),
        })
    }

    return {
        globalLoading,
        showLoading,
        hideLoading,
        debugLoadingState,
    }
})
