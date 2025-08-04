import type { ServerWebSocket } from 'bun'
import type { Buffer } from 'node:buffer'

import type { AuthSessionType, UserType } from '#/db/schema'

import { chatHandler } from './chat.handler'
import { notificationsHandler } from '../common/notifications.handler'
import { userHandler } from '../user/user.handler'
import { blackjackHandler } from '../blackjack/blackjack.handler' // Import the new handler
import { proxyHandler } from './proxy.handler'

// RPC helpers and contracts
import { rpcResultEnvelope, rpcErrorEnvelope } from 'shared/ws/envelope'
import type { WSMessage, RpcMessage } from 'shared/ws/protocol'
import type { UserEvents } from 'shared/ws/contracts'
import { eq } from 'drizzle-orm'
import db from '#/db'
import { vipInfo, wallets } from '#/db/schema'

// Define a map of topic names to their handlers
const topicHandlers = {
    chat: chatHandler,
    notifications: notificationsHandler,
    user: userHandler,
    blackjack: blackjackHandler, // Add the blackjack handler
    proxy: proxyHandler,
}

// Define an interface for the data attached to the WebSocket
export interface WebSocketData {
    user: UserType
    authSession: AuthSessionType
    topic: keyof typeof topicHandlers // The topic for this connection
}

export const websocketHandler = {
    open(ws: ServerWebSocket<WebSocketData>) {
        const { topic } = ws.data
        if (topicHandlers[topic]) {
            topicHandlers[topic].open(ws)
        } else {
            console.error(`No handler for topic: ${topic}`)
            ws.close(1011, 'Invalid topic')
        }
    },

    message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
        const { topic } = ws.data

        // Try to parse as a structured WSMessage for RPC support; fallback to legacy handler on failure.
        let parsed: WSMessage | null = null
        if (typeof message === 'string') {
            try {
                parsed = JSON.parse(message)
            } catch {
                parsed = null
            }
        } else {
            try {
                parsed = JSON.parse(new TextDecoder().decode(message as Buffer))
            } catch {
                parsed = null
            }
        }

        // Handle RPC messages for the 'user' topic
        if (parsed && parsed.kind === 'rpc' && topic === 'user') {
            const rpc = parsed as RpcMessage<'user', keyof any, any>
            void handleUserRpc(ws, rpc)
            return
        }

        // Default to existing topic handlers for non-RPC or other topics
        if (topicHandlers[topic]) {
            topicHandlers[topic].message(ws, message as any)
        }
    },

    close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
        const { topic } = ws.data
        if (topicHandlers[topic]) {
            // Pass all arguments to the topic handler's close method
            ;(topicHandlers[topic].close as any)(ws, code, reason)
        }
    },
}

/**
 * Handle RPC methods under the 'user' topic.
 * Currently supports:
 * - method: 'user.get' -> returns a snapshot of wallet + vipInfo for the current user
 */
async function handleUserRpc(
    ws: ServerWebSocket<WebSocketData>,
    rpc: RpcMessage<'user', string, any>
) {
    const { id, method } = rpc
    const { user } = ws.data

    try {
        switch (method) {
            case 'user.get': {
                const walletRow = await db.query.wallets.findFirst({
                    where: eq(wallets.userId, user.id),
                })
                const vipRow = await db.query.vipInfo.findFirst({
                    where: eq(vipInfo.userId, user.id),
                })

                const result: UserEvents['user.snapshot'] = {
                    userId: user.id,
                    user: {
                        id: user.id,
                        username: user.username,
                    } as Record<string, unknown>,
                    wallet: walletRow
                        ? { balance: walletRow.balance }
                        : undefined,
                    vipInfo: vipRow
                        ? {
                                level: vipRow.level,
                                xp: vipRow.xp,
                                totalXp: vipRow.totalXp,
                            }
                        : undefined,
                    ts: Date.now(),
                }

                const envelope = rpcResultEnvelope(id, result)
                ws.send(JSON.stringify(envelope))
                return
            }
            default: {
                const err = rpcErrorEnvelope(id, {
                    code: 'METHOD_NOT_FOUND',
                    message: `Unknown RPC method '${method}' for topic 'user'`,
                })
                ws.send(JSON.stringify(err))
            }
        }
    } catch (error: any) {
        const err = rpcErrorEnvelope(id, {
            code: 'INTERNAL_ERROR',
            message: error?.message ?? 'Unhandled RPC error',
        })
        ws.send(JSON.stringify(err))
    }
}
