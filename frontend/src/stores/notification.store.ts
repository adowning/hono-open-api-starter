import { defineStore } from 'pinia'
import { ref } from 'vue'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
    id: string
    message: string
    type: NotificationType
    timeout?: number
    createdAt: number
}

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<Notification[]>([])
    const defaultTimeout = 5000 // 5 seconds

    const addNotification = (notification: { type: NotificationType; message: string }, timeout: number = defaultTimeout) => {
        const id = Math.random().toString(36).substring(2, 9)
        const notificationObj: Notification = {
            id,
            message: notification.message,
            type: notification.type,
            timeout,
            createdAt: Date.now(),
        }

        notifications.value.push(notificationObj)

        if (timeout > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, timeout)
        }

        return id
    }

    const removeNotification = (id: string) => {
        const index = notifications.value.findIndex((n) => n.id === id)
        if (index !== -1) {
            notifications.value.splice(index, 1)
        }
    }

    const clearAllNotifications = () => {
        notifications.value = []
    }

    // Helper methods for different notification types
    const success = (message: string, timeout?: number) =>
        addNotification({ type: 'success', message }, timeout)
    const error = (message: string, timeout?: number) =>
        addNotification({ type: 'error', message }, timeout)
    const info = (message: string, timeout?: number) =>
        addNotification({ type: 'info', message }, timeout)
    const warning = (message: string, timeout?: number) =>
        addNotification({ type: 'warning', message }, timeout)

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        success,
        error,
        info,
        warning,
    }
})
