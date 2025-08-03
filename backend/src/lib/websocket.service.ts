import { eq } from 'drizzle-orm'

import db from '#/db'
import { vipInfo, wallets } from '#/db/schema'
import { server } from '#/index'

interface NotificationPayload {
    title: string;
    message: string;
    timestamp: string;
}

/**
 * Sends a real-time notification to a specific user.
 * @param userId - The ID of the user to notify.
 * @param payload - The notification content.
 */
export function sendNotificationToUser(userId: string, payload: Omit<NotificationPayload, 'timestamp'>) {
    if (!server) {
        console.error('WebSocket server is not available.')
        return
    }

    const topic = `notifications-${userId}`
    const message: NotificationPayload = {
        ...payload,
        timestamp: new Date().toISOString(),
    }

    // Bun's publish method returns the number of subscribers the message was sent to.
    const subscriberCount = server.publish(topic, JSON.stringify(message))
    console.log(`Sent notification to ${subscriberCount} client(s) on topic ${topic}`)
}

export async function triggerUserUpdate(userId: string) {
    if (!server) {
        console.error('WebSocket server is not available.')
        return
    }

    try {
    // Fetch the latest data from the database
        const wallet = await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) })
        const _vipInfo = await db.query.vipInfo.findFirst({ where: eq(vipInfo.userId, userId) })

        const payload = {
            wallet: {
                balance: wallet?.balance,
            },
            vipInfo: {
                level: _vipInfo?.level,
                xp: _vipInfo?.xp,
                totalXp: _vipInfo?.totalXp,
            },
        }

        const topic = `user-${userId}`
        const subscriberCount = server.publish(topic, JSON.stringify(payload))

        if (subscriberCount > 0) {
            console.log(`Pushed user data update to ${subscriberCount} client(s) on topic ${topic}`)
        }
    }
    catch (error) {
        console.error(`Failed to trigger user update for ${userId}:`, error)
    }
}
