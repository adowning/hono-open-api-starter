import type { ServerWebSocket } from 'bun'
import type { Buffer } from 'node:buffer'

import type { WebSocketData } from './websocket.handler'

export const chatHandler = {
    open(ws: ServerWebSocket<WebSocketData>) {
        const { user } = ws.data
        console.log(`User ${user.username} joined the chat`)
        ws.subscribe('chat')
        ws.publish('chat', `${user.username} has joined the chat.`)
        ws.send(`Welcome to the chat, ${user.username}!`)
    },

    message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
        const { user } = ws.data
        console.log(`Message from ${user.username} in chat:`, message)
        ws.publish('chat', `${user.username}: ${message}`)
    },

    close(ws: ServerWebSocket<WebSocketData>) {
        const { user } = ws.data
        console.log(`User ${user.username} left the chat`)
        ws.unsubscribe('chat')
        ws.publish('chat', `${user.username} has left the chat.`)
    },
}
