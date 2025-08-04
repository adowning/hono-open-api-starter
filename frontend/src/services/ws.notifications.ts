import { useEventManager } from '@/composables/EventManager'
import type { WSMessage, EventMessage } from 'shared/ws/protocol'
import type { NotificationsEvents } from 'shared/ws/contracts'

/**
 * Narrow EventManager emit signature locally to satisfy ESLint without using any.
 * Update the type if your EventManager defines concrete keys for notifications.
 */
type NotificationBus = {
  emit: (event: 'notifications.push' | 'notifications.read', payload: unknown) => void
}

/**
 * Notifications WebSocket bridge with reconnection and heartbeat.
 * Emits:
 * - 'notification:push' with the NotificationItem
 * - 'notification:read' with the notificationId
 */
class NotificationsWsBridge {
  private get bus(): NotificationBus {
    return useEventManager() as unknown as NotificationBus
  }
  private socket: WebSocket | null = null
  private connected = false

  // Reconnection/backoff + heartbeat
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private keepAliveTimer: number | null = null
  private lastPongTs = 0
  private readonly keepAliveIntervalMs = 15000
  private readonly pongTimeoutMs = 12000
  private readonly maxReconnectDelayMs = 30000

  public isConnected(): boolean {
    return this.connected && !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  /** Emit helper with typed event keys to avoid 'any' and unknown keys */
  private emitPush(payload: NotificationsEvents['notifications.push']) {
    this.bus.emit('notifications.push', payload.notification)
  }
  private emitRead(payload: NotificationsEvents['notifications.read']) {
    this.bus.emit('notifications.read', payload.notificationId)
  }

  private scheduleReconnect(accessToken?: string) {
    if (this.reconnectTimer) return
    const base = Math.min(1000 * 2 ** this.reconnectAttempts, this.maxReconnectDelayMs)
    const jitter = Math.floor(Math.random() * 500)
    const delay = base + jitter
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.reconnectAttempts++
      this.connect(accessToken)
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.lastPongTs = Date.now()
    this.keepAliveTimer = window.setInterval(() => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
      try {
        this.socket.send(JSON.stringify({ kind: 'ping', ts: Date.now() }))
      } catch {}
      if (Date.now() - this.lastPongTs > this.keepAliveIntervalMs + this.pongTimeoutMs) {
        try { this.socket?.close() } catch {}
      }
    }, this.keepAliveIntervalMs) as unknown as number
  }

  private stopHeartbeat() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = null
    }
  }

  public connect(accessToken?: string): void {
    if (this.isConnected()) return

    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      const url = new URL(`${proto}://${location.host}/ws/notifications`)
      if (accessToken) {
        url.searchParams.set('token', accessToken)
      }

      const ws = new WebSocket(url.toString())

      ws.onopen = () => {
        this.connected = true
        this.socket = ws
        this.reconnectAttempts = 0
        this.lastPongTs = Date.now()
        this.startHeartbeat()
      }

      ws.onmessage = (evt) => {
        this.lastPongTs = Date.now()

        let msg: WSMessage | null = null
        try {
          msg = JSON.parse(typeof evt.data === 'string' ? evt.data : String(evt.data))
        } catch {
          return
        }
        if (!msg) return

        // Treat any inbound message as activity for heartbeat purposes
        this.lastPongTs = Date.now()

        if (msg.kind !== 'event') return

        const ev = msg as EventMessage<'notifications', keyof NotificationsEvents, NotificationsEvents[keyof NotificationsEvents]>

        switch (ev.event) {
          case 'notifications.push': {
            const payload = ev.payload as NotificationsEvents['notifications.push']
            this.emitPush(payload)
            break
          }
          case 'notifications.read': {
            const payload = ev.payload as NotificationsEvents['notifications.read']
            this.emitRead(payload)
            break
          }
          default:
            break
        }
      }

      ws.onclose = () => {
        this.connected = false
        this.socket = null
        this.stopHeartbeat()
        this.scheduleReconnect(accessToken)
      }

      ws.onerror = () => {
        // onclose handles reconnection
      }
    } catch {
      // swallow and let reconnection handle subsequent attempts
    }
  }

  public close(): void {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
      this.stopHeartbeat()

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
    } finally {
      this.connected = false
      this.socket = null
    }
  }
}

export const notificationsWsBridge = new NotificationsWsBridge()