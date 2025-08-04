import { eq } from 'drizzle-orm'

import db from '#/db'
import { vipInfo, wallets } from '#/db/schema'
import { server } from '#/index'
import { eventEnvelope } from 'shared/ws/envelope'
import type { UserEvents } from 'shared/ws/contracts'

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

/**
 * Typed publisher: send 'user.updated' patch event to the user's private channel.
 */
export function publishUserUpdated(userId: string, patch: UserEvents['user.updated']['patch']): void {
    if (!server) {
        console.error('WebSocket server is not available.')
        return
    }
    const envelope = eventEnvelope('user', 'user.updated', {
        userId,
        patch,
        ts: Date.now(),
    } as UserEvents['user.updated'])
    const topic = `user-${userId}`
    const sent = server.publish(topic, JSON.stringify(envelope))
    if (sent > 0) {
        console.log(`Pushed user.updated to ${sent} client(s) on topic ${topic}`)
    }
}

/**
 * Typed publisher: send 'user.snapshot' full snapshot to the user's private channel.
 */
export function publishUserSnapshot(params: {
    userId: string
    user?: Record<string, unknown>
    wallet?: Record<string, unknown>
    vipInfo?: Record<string, unknown>
    ts?: number
}): void {
    if (!server) {
        console.error('WebSocket server is not available.')
        return
    }
    const envelope = eventEnvelope('user', 'user.snapshot', {
        userId: params.userId,
        user: params.user,
        wallet: params.wallet,
        vipInfo: params.vipInfo,
        ts: params.ts ?? Date.now(),
    } as UserEvents['user.snapshot'])
    const topic = `user-${params.userId}`
    const sent = server.publish(topic, JSON.stringify(envelope))
    if (sent > 0) {
        console.log(`Pushed user.snapshot to ${sent} client(s) on topic ${topic}`)
    }
}

/**
 * DEPRECATED: Previously pushed ad-hoc payloads. Now delegates to typed snapshot publisher.
 * Intentionally keeps the DB fetch to preserve behavior of sending fresh data.
 */
export async function triggerUserUpdate(userId: string) {
    if (!server) {
        console.error('WebSocket server is not available.')
        return
    }

    try {
        // Fetch the latest data from the database
        const walletRow = await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) })
        const vipRow = await db.query.vipInfo.findFirst({ where: eq(vipInfo.userId, userId) })

        publishUserSnapshot({
            userId,
            wallet: walletRow ? { balance: walletRow.balance } : undefined,
            vipInfo: vipRow
                ? { level: vipRow.level, xp: vipRow.xp, totalXp: vipRow.totalXp }
                : undefined,
        })
    } catch (error) {
        console.error(`Failed to trigger user update for ${userId}:`, error)
    }
}
