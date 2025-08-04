// Helpers to build typed WS envelopes

import type {
  CorrelationId,
  EventMessage,
  RpcErrorMessage,
  RpcMessage,
  RpcResultMessage,
  Topic,
  WSVersion,
} from 'shared/ws/protocol'

export const VERSION: WSVersion = '1'

export function eventEnvelope<TTopic extends Topic, TEvent extends string, TPayload>(
  topic: TTopic,
  event: TEvent,
  payload: TPayload,
  ts: number = Date.now()
): EventMessage<TTopic, TEvent, TPayload> {
  return {
    v: VERSION,
    kind: 'event',
    topic,
    event,
    payload,
    ts,
  }
}

export function rpcEnvelope<TTopic extends Topic, TMethod extends string, TParams>(
  topic: TTopic,
  method: TMethod,
  params: TParams,
  id: CorrelationId,
  ts: number = Date.now()
): RpcMessage<TTopic, TMethod, TParams> {
  return {
    v: VERSION,
    kind: 'rpc',
    topic,
    method,
    params,
    id,
    ts,
  }
}

export function rpcResultEnvelope<TResult>(
  id: CorrelationId,
  result: TResult,
  ts: number = Date.now()
): RpcResultMessage<TResult> {
  return {
    v: VERSION,
    kind: 'rpc_result',
    id,
    result,
    ts,
  }
}

export function rpcErrorEnvelope(
  id: CorrelationId,
  error: { code: string; message: string; data?: unknown },
  ts: number = Date.now()
): RpcErrorMessage {
  return {
    v: VERSION,
    kind: 'rpc_error',
    id,
    error,
    ts,
  }
}