// Shared contracts defining per-topic events and RPC shapes

import type { EventMessage, RpcMessage } from 'shared/ws/protocol'

/**
* Represents a partial user update patch delivered over WebSocket.
* Prefer small targeted patches to reduce payload size.
*/
export type UserPatch = {
 user?: Record<string, unknown>
 wallet?: Record<string, unknown>
 vipInfo?: Record<string, unknown>
}

/**
* User topic events:
* - 'user.updated' for patch-based updates
* - 'user.snapshot' for a full snapshot
*/
export type UserEvents = {
 'user.updated': { userId: string; patch: UserPatch; ts: number }
 'user.snapshot': {
   userId: string
   user?: Record<string, unknown>
   wallet?: Record<string, unknown>
   vipInfo?: Record<string, unknown>
   ts: number
 }
}

// RPC map for user topic (extend later as needed)
export type UserRpc = {
 'user.get': { userId?: string }
}
export type UserRpcResults = {
 'user.get': {
   userId: string
   user?: Record<string, unknown>
   wallet?: Record<string, unknown>
   vipInfo?: Record<string, unknown>
   ts: number
 }
}

/**
* Notifications topic events:
* - 'notifications.push' for an incoming notification
* - 'notifications.read' when a notification is marked read
* Extend with more events as needed (bulk read, clear, etc.)
*/
export type NotificationItem = {
 id: string
 title: string
 message: string
 createdAt: string
 read?: boolean
}
export type NotificationsEvents = {
 'notifications.push': { userId: string; notification: NotificationItem; ts: number }
 'notifications.read': { userId: string; notificationId: string; ts: number }
}
export type NotificationsRpc = {
 'notifications.list': { limit?: number }
}
export type NotificationsRpcResults = {
 'notifications.list': { items: NotificationItem[]; ts: number }
}

/**
* Chat topic events:
* - 'chat.message' for a new chat message broadcast
* - 'chat.joined' / 'chat.left' for presence updates
*/
export type ChatMessage = {
 id: string
 userId: string
 username?: string
 text: string
 createdAt: string
}
export type ChatEvents = {
 'chat.message': { room: string; message: ChatMessage; ts: number }
 'chat.joined': { room: string; userId: string; username?: string; ts: number }
 'chat.left': { room: string; userId: string; username?: string; ts: number }
}
export type ChatRpc = {
 'chat.send': { room: string; text: string }
 'chat.history': { room: string; limit?: number }
}
export type ChatRpcResults = {
 'chat.send': { ok: true; id: string; ts: number }
 'chat.history': { room: string; messages: ChatMessage[]; ts: number }
}

/**
* Blackjack topic events (skeleton):
* - 'blackjack.state' for table/game state updates
* - 'blackjack.action' acknowledgement
*/
export type BlackjackState = Record<string, unknown>
export type BlackjackEvents = {
 'blackjack.state': { tableId: string; state: BlackjackState; ts: number }
 'blackjack.action': { tableId: string; userId: string; action: string; ts: number }
}
export type BlackjackRpc = {
 'blackjack.join': { tableId: string }
 'blackjack.hit': { tableId: string }
 'blackjack.stand': { tableId: string }
}
export type BlackjackRpcResults = {
 'blackjack.join': { ok: true; tableId: string; ts: number }
 'blackjack.hit': { ok: true; tableId: string; ts: number }
 'blackjack.stand': { ok: true; tableId: string; ts: number }
}

// Aggregate topic contracts for convenience
export type TopicEvents = {
 user: UserEvents
 notifications: NotificationsEvents
 chat: ChatEvents
 blackjack: BlackjackEvents
}

export type TopicRpc = {
 user: UserRpc
 notifications: NotificationsRpc
 chat: ChatRpc
 blackjack: BlackjackRpc
}

export type TopicRpcResults = {
 user: UserRpcResults
 notifications: NotificationsRpcResults
 chat: ChatRpcResults
 blackjack: BlackjackRpcResults
}

// Type helpers for envelopes
export type UserEventEnvelope<K extends keyof UserEvents> = EventMessage<'user', K, UserEvents[K]>
export type UserRpcEnvelope<K extends keyof UserRpc> = RpcMessage<'user', K, UserRpc[K]>

// Notifications helpers
export type NotificationsEventEnvelope<K extends keyof NotificationsEvents> =
 EventMessage<'notifications', K, NotificationsEvents[K]>
export type NotificationsRpcEnvelope<K extends keyof NotificationsRpc> =
 RpcMessage<'notifications', K, NotificationsRpc[K]>

// Chat helpers
export type ChatEventEnvelope<K extends keyof ChatEvents> =
 EventMessage<'chat', K, ChatEvents[K]>
export type ChatRpcEnvelope<K extends keyof ChatRpc> =
 RpcMessage<'chat', K, ChatRpc[K]>

// Blackjack helpers
export type BlackjackEventEnvelope<K extends keyof BlackjackEvents> =
 EventMessage<'blackjack', K, BlackjackEvents[K]>
export type BlackjackRpcEnvelope<K extends keyof BlackjackRpc> =
 RpcMessage<'blackjack', K, BlackjackRpc[K]>