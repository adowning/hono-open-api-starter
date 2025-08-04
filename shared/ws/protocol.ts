// Shared WebSocket protocol: versioned, fully-typed envelopes for events and RPC

export type WSVersion = '1'
export type WSEventKind = 'event' | 'rpc' | 'rpc_result' | 'rpc_error'
export type CorrelationId = string

// Topic names supported by backend. Extend as new topics are added.
export type Topic = 'user' | 'chat' | 'notifications' | 'blackjack' | 'proxy'

// Generic event envelope
export type EventMessage<
  TTopic extends Topic = Topic,
  TEvent extends string = string,
  TPayload = unknown
> = {
  v: WSVersion
  kind: 'event'
  topic: TTopic
  event: TEvent
  payload: TPayload
  ts?: number
}

// Generic RPC request envelope
export type RpcMessage<
  TTopic extends Topic = Topic,
  TMethod extends string = string,
  TParams = unknown
> = {
  v: WSVersion
  kind: 'rpc'
  topic: TTopic
  method: TMethod
  params: TParams
  id: CorrelationId
  ts?: number
}

// Generic RPC success result envelope
export type RpcResultMessage<TResult = unknown> = {
  v: WSVersion
  kind: 'rpc_result'
  id: CorrelationId
  result: TResult
  ts?: number
}

// Generic RPC error envelope
export type RpcErrorMessage = {
  v: WSVersion
  kind: 'rpc_error'
  id: CorrelationId
  error: {
    code: string
    message: string
    data?: unknown
  }
  ts?: number
}

// Discriminated union of all message types
export type WSMessage =
  | EventMessage<any, any, any>
  | RpcMessage<any, any, any>
  | RpcResultMessage<any>
  | RpcErrorMessage