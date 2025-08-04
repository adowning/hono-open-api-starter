import { useEventManager } from '@/composables/EventManager'
import type { WSMessage, EventMessage, RpcMessage } from 'shared/ws/protocol'
import type { UserEvents } from 'shared/ws/contracts'
import type { ModelChangeEventFromServer } from '@/types/events'

/**
 * Map raw WS payload (Record) into the app's typed ModelChangeEventFromServer shape.
 * The backend currently sends plain snapshots/patches; we wrap them for the existing EventManager contract.
 */
function toModelChange(type: string, data: unknown): ModelChangeEventFromServer {
  return {
    type,
    action: 'update',
    data,
  } as ModelChangeEventFromServer
}

/**
 * Lightweight user-topic WebSocket bridge.
 * - Connects to /ws/user with current location origin
 * - Forwards typed events to the global EventManager:
 *   - user.updated: emits 'user:updated', 'wallet:updated', 'vip:updated' (patch-based)
 *   - user.snapshot: same as above but with snapshot payload
 *
 * The actual merging into Pinia stores is handled by useRealtimeUpdates composable.
 */
class UserWsBridge {
  private socket: WebSocket | null = null
  private connected = false

  // RPC state
  private inflight = new Map<string, {
    // Use TResult as unknown at storage boundary; cast on resolve to satisfy TS
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
    timer: number
  }>()

  // Reconnection/backoff + heartbeat
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private keepAliveTimer: number | null = null
  private lastPongTs = 0
  private readonly keepAliveIntervalMs = 15000
  private readonly pongTimeoutMs = 12000
  private readonly maxReconnectDelayMs = 30000

  private nextId(): string {
    // lightweight correlation id
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  private scheduleReconnect(accessToken?: string) {
    if (this.reconnectTimer) return
    // Exponential backoff with jitter
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
        // Use a lightweight ping frame. If server echoes message events only,
        // we still update lastPongTs on any inbound event below.
        this.socket.send(JSON.stringify({ kind: 'ping', ts: Date.now() }))
      } catch {}
      // If no inbound traffic for too long, force-close to trigger reconnect
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

  public isConnected(): boolean {
    return this.connected && !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  public connect(accessToken?: string): void {
    if (this.isConnected()) return

    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      const url = new URL(`${proto}://${location.host}/ws/user`)
      if (accessToken) {
        url.searchParams.set('token', accessToken)
      }

      const ws = new WebSocket(url.toString())
      const eventManager = useEventManager()

      ws.onopen = () => {
        this.connected = true
        this.socket = ws
      }

      ws.onmessage = (evt) => {
        let msg: WSMessage | null = null
        try {
          msg = JSON.parse(typeof evt.data === 'string' ? evt.data : String(evt.data))
        } catch {
          return
        }
        if (!msg || msg.kind !== 'event') return

        const ev = msg as EventMessage<'user', keyof UserEvents, UserEvents[keyof UserEvents]>
        switch (ev.event) {
          case 'user.updated': {
            const payload = ev.payload as UserEvents['user.updated']
            if (payload.patch?.user) eventManager.emit('user:updated', toModelChange('user', payload.patch.user))
            if (payload.patch?.wallet) eventManager.emit('wallet:updated', toModelChange('wallet', payload.patch.wallet))
            if (payload.patch?.vipInfo) eventManager.emit('vip:updated', toModelChange('vip', payload.patch.vipInfo))
            break
          }
          case 'user.snapshot': {
            const payload = ev.payload as UserEvents['user.snapshot']
            if (payload.user) eventManager.emit('user:updated', toModelChange('user', payload.user))
            if (payload.wallet) eventManager.emit('wallet:updated', toModelChange('wallet', payload.wallet))
            if (payload.vipInfo) eventManager.emit('vip:updated', toModelChange('vip', payload.vipInfo))
            break
          }
          default:
            break
        }
      }

      ws.onclose = () => {
        this.connected = false
        this.socket = null
      }

      ws.onerror = () => {
        // handled by onclose
      }
    } catch {
      // swallow connection errors
    }
  }

  public close(): void {
    try {
      // cancel reconnection attempts
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }

      // stop heartbeat
      this.stopHeartbeat()

      // reject all inflight RPCs
      for (const [, entry] of this.inflight) {
        clearTimeout(entry.timer)
        entry.reject({ code: 'CONNECTION_CLOSED', message: 'WebSocket closed' })
      }
      this.inflight.clear()

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
    } finally {
      this.connected = false
      this.socket = null
    }
  }

  /**
   * Send an RPC request over the user topic.
   */
  public rpc<TMethod extends string = string, TParams = unknown, TResult = unknown>(
    method: TMethod,
    params: TParams,
    timeoutMs: number = 8000
  ): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject({ code: 'NOT_CONNECTED', message: 'WebSocket is not open' })
        return
      }
      const id = this.nextId()
      const payload: RpcMessage<'user', string, unknown> = {
        v: '1',
        kind: 'rpc',
        topic: 'user',
        method,
        params,
        id,
        ts: Date.now(),
      }
      const timer = window.setTimeout(() => {
        const inflight = this.inflight.get(id)
        if (inflight) {
          this.inflight.delete(id)
          reject({ code: 'TIMEOUT', message: `RPC ${method} timed out` })
        }
      }, timeoutMs)

      // Wrap resolve to 'unknown' to align with inflight map signature
      const wrappedResolve = (value: unknown) => resolve(value as TResult)
      this.inflight.set(id, { resolve: wrappedResolve as (value: unknown) => void, reject, timer })
      try {
        this.socket.send(JSON.stringify(payload))
      } catch (err) {
        clearTimeout(timer)
        this.inflight.delete(id)
        reject({ code: 'SEND_FAILED', message: 'Failed to send RPC', data: err })
      }
    })
  }

  /**
   * Convenience helper to fetch a fresh user snapshot.
   */
  public async getUser(): Promise<UserEvents['user.snapshot']> {
    const result = await this.rpc<'user.get', { userId?: string }, UserEvents['user.snapshot']>('user.get', {})
    return result
  }
}

export const userWsBridge = new UserWsBridge()