import { useAuthStore } from '@/stores/auth.store'
import { useEventManager } from '@/composables/EventManager'
import type { WebSocketMessages } from '@/types/websocket'

class WebSocketService {
    private socket: WebSocket | null = null
    private gameSocket: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private eventManager = useEventManager()

    public async initConnection(): Promise<void> {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || this.socket) return

        const wsUrl = this.buildWebSocketUrl('/ws/user')
        this.socket = new WebSocket(wsUrl)
        this.setupSocketHandlers(this.socket, 'main')
    }

    public initGameConnection(gameId: string): void {
        if (this.gameSocket) {
            this.gameSocket.close()
        }

        const wsUrl = this.buildWebSocketUrl(`/ws/game/${gameId}`)
        this.gameSocket = new WebSocket(wsUrl)
        this.setupSocketHandlers(this.gameSocket, 'game')
    }

    private setupSocketHandlers(
        socket: WebSocket,
        type: 'main' | 'game'
    ): void {
        socket.onopen = (): void => {
            console.log(`${type} WebSocket connected`)
            this.reconnectAttempts = 0
        }

        socket.onmessage = (event: MessageEvent): void => {
            try {
                const data = JSON.parse(event.data.toString())
                this.handleIncomingMessage(data)
            } catch (error) {
                console.error('Error parsing WebSocket message:', error)
            }
        }

        socket.onclose = (): void => {
            console.log(`${type} WebSocket disconnected`)
            this.handleReconnect(type)
        }

        socket.onerror = (error: Event): void => {
            console.error(`${type} WebSocket error:`, error)
        }
    }

    private handleIncomingMessage(data: unknown): void {
        try {
            if (!data || typeof data !== 'object') {
                console.warn(
                    'Received invalid WebSocket message: Not an object',
                    data
                )
                return
            }

            const message = data as WebSocketMessages

            // Validate message structure
            if (!message.type || !message.payload) {
                console.warn(
                    'Received invalid WebSocket message: Missing type or payload',
                    message
                )
                return
            }

            // Handle different message types
            switch (message.type) {
                case 'user:update':
                    this.eventManager.emit('user:updated', message.payload)
                    break
                case 'wallet:update':
                    this.eventManager.emit('wallet:updated', message.payload)
                    break
                case 'vip:update':
                    this.eventManager.emit('vip:updated', message.payload)
                    break
                default:
                    console.warn(
                        `Unknown message type: ${message.type}`,
                        message
                    )
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error, data)
        }
    }

    private handleReconnect(type: 'main' | 'game'): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached')
            return
        }

        this.reconnectAttempts++
        const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

        setTimeout(
            () => {
                if (type === 'main') {
                    this.initConnection()
                }
            },
            Math.min(delay, 30000)
        )
    }

    private buildWebSocketUrl(path: string): string {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host =
            import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') ||
            window.location.host
        const token = useAuthStore().accessToken
        return `${protocol}//${host}${path}?token=${token}`
    }

    public closeConnections(): void {
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
        if (this.gameSocket) {
            this.gameSocket.close()
            this.gameSocket = null
        }
    }

    /**
     * Check if the main WebSocket connection is active
     */
    public isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN
    }
}

export const webSocketService = new WebSocketService()
