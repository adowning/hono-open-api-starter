import type { Server, ServerWebSocket, WebSocketHandler } from 'bun'
import chalk from 'chalk'
import { and, eq } from 'drizzle-orm'
import * as jose from 'jose'

import app from './app'
import db from './db'
import { authSessions, users } from './db/schema'
import env from './env'
import { decrypt, lzwDecode, } from './utils/lzw'
import { websocketHandler } from './modules/websocket/websocket.handler'


const port = env.PORT

console.log(`Server is running on http://localhost:${port}`)

// Assign the server instance to a constant
const server: Server = Bun.serve({
    port,
    async fetch(req, server) {
        const url = new URL(req.url)
        const match = /^\/ws\/(?<topic>\w+)$/.exec(url.pathname)
        if (url.pathname.includes('ws/proxy')) {
            console.log(url.searchParams.get('data'))
        }

        if (url.pathname.includes('EjsFrontWeb/fs')) {
            console.log('here')
            // const whatWeNeed = await fetch('https://dev.cashflowcasino.com/EjsFrontWeb/fs', {
            //     headers: {
            //         'accept': 'application/json',
            //         'accept-language': 'en-US,en;q=0.9,es;q=0.8,pt;q=0.7',
            //         'cache-control': 'no-cache',
            //         'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            //         'pragma': 'no-cache',
            //         'priority': 'u=1, i',
            //         'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            //         'sec-ch-ua-mobile': '?0',
            //         'sec-ch-ua-platform': '"Linux"',
            //         'sec-fetch-dest': 'empty',
            //         'sec-fetch-mode': 'cors',
            //         'sec-fetch-site': 'cross-site'
            //     },
            //     body: 'action=open_game&clientString=FAKE1&language=en&gameCodeString=TheCrypt%40desktop',
            //     method: 'POST'
            // })
            const whatWeNeed = { b: 'a' }
            console.log(whatWeNeed)
            const request = new Request('https://partner.nolimitcity.com/EjsFrontWeb/fs', {
                method: 'POST',
                body: 'action=open_game&clientString=FAKE1&language=en&gameCodeString=TheCrypt%40desktop',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            })
            console.log(request)

            const response = await fetch(request)
            console.log(response)

            const json = await response.json()
            console.log(json)
            return new Response(JSON.stringify(json), {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            })
        }
        if (match) {
            const topic = match.groups?.topic as keyof typeof websocketHandler
            const token = url.searchParams.get('token')

            if (!token) {
                console.error(chalk.red('[WS Auth] No token provided.'))
                return new Response('Unauthorized: No token provided', {
                    status: 401,
                })
            }

            try {
                const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
                const { payload } = await jose.jwtVerify(token, secret)

                if (!payload.userId || !payload.sessionId) {
                    console.error(
                        chalk.red('[WS Auth] Invalid token payload.')
                    )
                    return new Response('Unauthorized: Invalid token payload', {
                        status: 401,
                    })
                }

                const authSession = await db.query.authSessions.findFirst({
                    where: and(
                        eq(authSessions.id, payload.sessionId as string),
                        eq(authSessions.status, 'ACTIVE')
                    ),
                })

                if (!authSession) {
                    console.error(
                        chalk.red(
                            `[WS Auth] Session not found or expired for session ID: ${payload.sessionId}`
                        )
                    )
                    return new Response(
                        'Unauthorized: Session not found or has expired',
                        { status: 401 }
                    )
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.id, payload.userId as string),
                })

                if (!user) {
                    console.error(
                        chalk.red(
                            `[WS Auth] User not found for user ID: ${payload.userId}`
                        )
                    )
                    return new Response('Unauthorized: User not found', {
                        status: 401,
                    })
                }

                // If all checks pass, upgrade the connection.
                if (
                    server.upgrade(req, { data: { user, authSession, topic } })
                ) {
                    console.log(
                        chalk.green(
                            `[WS Auth] Successful upgrade for user ${user.username} on topic '${topic}'`
                        )
                    )
                    return // Bun handles the response after a successful upgrade.
                }

                // This should not be reached if upgrade is successful.
                return new Response('WebSocket upgrade failed', { status: 500 })
            } catch (error: any) {
                console.error(
                    chalk.red('[WS Auth] Token verification failed:'),
                    error.message
                )
                return new Response(`Unauthorized: ${error.message}`, {
                    status: 401,
                })
            }
        }

        // Fallback to Hono for all non-WebSocket requests.
        return app.fetch(req, server)
    },
    websocket: websocketHandler,
    error() {
        return new Response('Uh oh!!', { status: 500 })
    },
})

// Export the server instance
export { server }

// The backend WebSocket server you want to proxy connections to.
const TARGET_WS_URL = 'wss://demo.nolimitcity.com/EjsGameWeb/ws/game?data='

/**
 * Defines the shape of the data attached to each client WebSocket connection.
 * This provides type safety for accessing `ws.data`.
 */
interface WebSocketContext {
    backendSocket: WebSocket;
    messageQueue: (string | Uint8Array)[];
    nolimitSessionKey: string
    id: string
}

console.log(` Bun WebSocket Proxy (TypeScript Edition) `)
console.log(`-------------------------------------------`)
console.log(`Forwarding from localhost:3000 -> ${TARGET_WS_URL}\n`)

// We define the handler object separately to apply strong types.
// It uses our WebSocketContext for its generic type.
const webSocketHandler: WebSocketHandler<WebSocketContext> = {
    /**
     * Called when a client successfully connects to this proxy server.
     * @param ws The client WebSocket connection, typed with our context.
     */
    open(ws: ServerWebSocket<WebSocketContext>) {
        console.log('✅ Client connected to proxy.')
        const { backendSocket, messageQueue } = ws.data

        backendSocket.onopen = () => {
            console.log('✅ Proxy connected to backend.')

            // ✨ NEW: Process and send all queued messages.
            console.log(`▶️ Flushing ${messageQueue.length} queued message(s)...`)
            for (const msg of messageQueue) {
                backendSocket.send(msg)
            }
            // Clear the queue after flushing.
            ws.data.messageQueue = []
        }

        backendSocket.onmessage = (event: MessageEvent) => {
            // console.log(`[RECV ◀️ Backend] ${event.data}`)

            // console.log('--- Decrypting RC4 ---')
            // console.log('using key:', ws.data.nolimitSessionKey)
            // const result = s.decrypt(event.data, ws.data.nolimitSessionKey)
            // console.log(result)
            // console.log(event.data)
            // 2. Decrypt the raw data using the hex key
            // const rc4Decrypted = rc4Api.decryptRaw(ws.data.nolimitSessionKey, event.data)
            // const rc4Decrypted = rc42(ws.data.nolimitSessionKey, event.data)
            // console.log('RC4 Output (first 100 chars):', `${rc4Decrypted.substring(0, 100)}...`)

            // console.log('\n--- Decompressing LZW ---')
            // 3. Decompress the decrypted data
            const finalResult = lzwDecode(event.data)
            // console.log('Final Result (first 1500 chars):', `${finalResult.substring(0, 1500)}...`)
            console.log(JSON.parse(finalResult))
            ws.send(event.data)
        }

        backendSocket.onclose = (event: CloseEvent) => {
            console.log(`❌ Backend connection closed: ${event.code}`)
            ws.close(event.code, event.reason)
        }

        backendSocket.onerror = () => {
            console.error('❌ Backend connection error.')
            ws.close()
        }
    },

    /**
     * Called when the proxy receives a message from the client.
     * @param ws The client WebSocket connection.
     * @param message The message, which can be a string or a buffer.
     */
    message(ws: ServerWebSocket<WebSocketContext>, message: string | Uint8Array) {
        const { backendSocket, messageQueue } = ws.data

        // ✨ UPDATED LOGIC: If the backend is open, send. If it's connecting, queue.
        if (backendSocket.readyState === WebSocket.OPEN) {
            // console.log(`[SEND ▶️ Backend] ${message}`)
            // const finalResult = lzwDecode(message)
            // console.log('Final Result (first 1500 chars):', `${finalResult.substring(0, 1500)}...`)
            // console.log(JSON.parse(finalResult))
            console.log(decrypt(ws.data.nolimitSessionKey, message))
            backendSocket.send(message)
        } else if (backendSocket.readyState === WebSocket.CONNECTING) {
            console.log(`[QUEUE ➡️] Message queued as backend is not ready.`)
            messageQueue.push(message)
        }
    },

    /**
     * Called when the client's connection to the proxy is closed.
     * @param ws The client WebSocket connection.
     */
    close(ws: ServerWebSocket<WebSocketContext>) {
        console.log('❌ Client disconnected from proxy.')
        const { backendSocket } = ws.data

        if (backendSocket.readyState === WebSocket.OPEN || backendSocket.readyState === WebSocket.CONNECTING) {
            backendSocket.close()
        }
    },
}

const server2: Server = Bun.serve({
    port: 3000,

    fetch(req: Request, server: Server): Response | undefined {
    // We pass the generic type to server.upgrade to ensure the context is correctly typed.
        const url = new URL(req.url)
        const key = url.searchParams.get('data')
        console.log(key)
        if (key == null)
            return new Response('No key', { status: 401 })

        const success = server.upgrade<WebSocketContext>(req, {
            data: {
                backendSocket: new WebSocket(TARGET_WS_URL + key),
                messageQueue: [],
                nolimitSessionKey: key,
                id: 'hai2u'
            },
        })

        if (!success) {
            return new Response('This is a WebSocket endpoint.', { status: 400 })
        }

        // On successful upgrade, Bun handles the response automatically.
        return undefined
    },

    // Assign our strongly-typed handler to the server configuration.
    websocket: webSocketHandler,
})

console.log(`Proxy server running on http://localhost:${server2.port}`)


