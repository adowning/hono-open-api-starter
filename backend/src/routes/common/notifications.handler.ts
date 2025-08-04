import type { ServerWebSocket } from 'bun'
import type { Buffer } from 'node:buffer'
import { eventEnvelope } from 'shared/ws/envelope'
import type { NotificationsEvents } from 'shared/ws/contracts'

type WS = ServerWebSocket<any>

// Topic channel base; messages are per-user when possible
const CHANNEL = 'notifications'

export const notificationsHandler = {
    open(ws: WS) {
        console.log('[WS][notifications] open')
        ws.subscribe(CHANNEL)
    },

    close(ws: WS) {
        console.log('[WS][notifications] close')
        ws.unsubscribe(CHANNEL)
    },

    /**
     * Accepts raw messages and, if strings with simple commands, rebroadcasts typed events.
     * This keeps compatibility with existing publisher code that may send raw strings.
     * Prefer publishing through typed helpers in services moving forward.
     */
    message(ws: WS, message: string | Buffer) {
        try {
            const raw = typeof message === 'string' ? message : message.toString()
            // Minimal compatibility: accept JSON with { type: 'push'|'read', ... }
            let data: any
            try {
                data = JSON.parse(raw)
            } catch {
                console.log('[WS][notifications] non-JSON payload ignored:', raw)
                return
            }

            if (data?.type === 'push' && data?.notification && data?.userId) {
                const payload: NotificationsEvents['notifications.push'] = {
                    userId: String(data.userId),
                    notification: {
                        id: String(data.notification.id ?? crypto.randomUUID?.() ?? Date.now().toString()),
                        title: String(data.notification.title ?? ''),
                        message: String(data.notification.message ?? ''),
                        createdAt: String(data.notification.createdAt ?? new Date().toISOString()),
                        read: Boolean(data.notification.read ?? false),
                    },
                    ts: Date.now(),
                }
                const envelope = eventEnvelope('notifications', 'notifications.push', payload)
                const topic = `${CHANNEL}-${payload.userId}`
                ws.publish(topic, JSON.stringify(envelope))
                return
            }

            if (data?.type === 'read' && data?.notificationId && data?.userId) {
                const payload: NotificationsEvents['notifications.read'] = {
                    userId: String(data.userId),
                    notificationId: String(data.notificationId),
                    ts: Date.now(),
                }
                const envelope = eventEnvelope('notifications', 'notifications.read', payload)
                const topic = `${CHANNEL}-${payload.userId}`
                ws.publish(topic, JSON.stringify(envelope))
                return
            }

            console.log('[WS][notifications] unrecognized payload:', data)
        } catch (e) {
            console.error('[WS][notifications] message handler error:', e)
        }
    },
}
