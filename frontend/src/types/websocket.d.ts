// WebSocket message types
export type WebSocketMessage<T = unknown> = {
  type: string
  payload: T
  timestamp: number
}

// User update message
export type UserUpdateMessage = WebSocketMessage<{
  id: string
  username: string
  email?: string | null
  // Add other user fields as needed
}>

// Wallet update message
export type WalletUpdateMessage = WebSocketMessage<{
  balance: number
  currency: string
  // Add other wallet fields as needed
}>

// VIP info update message
export type VipUpdateMessage = WebSocketMessage<{
  level: number
  points: number
  // Add other VIP fields as needed
}>

// Game-specific message
export type GameUpdateMessage = WebSocketMessage<{
  gameId: string
  // Add game-specific fields
}>

// Union type for all possible WebSocket messages
export type WebSocketMessages =
  | UserUpdateMessage
  | WalletUpdateMessage
  | VipUpdateMessage
  | GameUpdateMessage

// Extend Window interface to include WebSocket types
declare global {
  interface WebSocket {
    onopen: ((this: WebSocket, ev: Event) => unknown) | null
    onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null
    onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null
    onerror: ((this: WebSocket, ev: Event) => unknown) | null
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
    close(code?: number, reason?: string): void
    readonly readyState: number
    readonly url: string
  }

  const WebSocket: {
    prototype: WebSocket
    new (url: string | URL, protocols?: string | string[]): WebSocket
    readonly CONNECTING: 0
    readonly OPEN: 1
    readonly CLOSING: 2
    readonly CLOSED: 3
  }
}
