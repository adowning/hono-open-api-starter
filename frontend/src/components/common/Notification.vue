<template>
    <TransitionGroup name="notification" tag="div" class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-xs">
        <div v-for="notification in notifications" :key="notification.id"
            class="p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform"
            :class="notificationClasses(notification.type)" @click="removeNotification(notification.id)">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <component :is="notificationIcon(notification.type)" class="h-5 w-5" />
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                    <p class="text-sm font-medium">
                        {{ notification.message }}
                    </p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                        :class="closeButtonClasses(notification.type)"
                        @click.stop="removeNotification(notification.id)">
                        <span class="sr-only">Close</span>
                        <XMarkIcon class="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/solid'
import { useNotificationStore } from '@/stores/notification.store'
import { storeToRefs } from 'pinia'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore

const notificationIcon = (type: string) => {
    switch (type) {
        case 'success':
            return CheckCircleIcon
        case 'error':
            return ExclamationCircleIcon
        case 'warning':
            return ExclamationTriangleIcon
        default:
            return InformationCircleIcon
    }
}

const notificationClasses = (type: string) => {
    const base = 'bg-white dark:bg-gray-800 border-l-4'
    const typeClasses = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500',
    }
    return `${base} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`
}

const closeButtonClasses = (type: string) => {
    const base = 'focus:ring-2 focus:ring-offset-2 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none'
    const typeClasses = {
        success: 'focus:ring-green-500 hover:text-green-500',
        error: 'focus:ring-red-500 hover:text-red-500',
        warning: 'focus:ring-yellow-500 hover:text-yellow-500',
        info: 'focus:ring-blue-500 hover:text-blue-500',
    }
    return `${base} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.notification-move {
    transition: transform 0.3s ease;
}
</style>
