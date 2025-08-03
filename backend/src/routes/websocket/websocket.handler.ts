import type { ServerWebSocket } from 'bun'
import type { Buffer } from 'node:buffer'

import type { AuthSessionType, UserType } from '#/db/schema'

import { chatHandler } from './chat.handler'
import { notificationsHandler } from '../common/notifications.handler'
import { userHandler } from '../user/user.handler'
import { blackjackHandler } from '../blackjack/blackjack.handler' // Import the new handler
import { proxyHandler } from './proxy.handler'

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
