// PATH: frontend/src/composables/EventManager.ts

import { AnimationEventFromServer, BalanceUpdatePayload, ModelChangeEventFromServer } from '@/types/events'


/**
 * Defines all possible events and their payload structures.
 * This ensures type safety across the application for event handling.
 */
export interface Events {
  'balance:update': BalanceUpdatePayload
  settingsModal: boolean
  'xp:gain': BalanceUpdatePayload
  'animation:add': AnimationEventFromServer
  'animation:update': AnimationEventFromServer
  'animation:remove': AnimationEventFromServer
  'animation:clear-by-owner': AnimationEventFromServer
  'animation:clear-all': AnimationEventFromServer
  'user:updated': ModelChangeEventFromServer 
  'wallet:updated': ModelChangeEventFromServer
  'vip:updated': ModelChangeEventFromServer
  hideBottomBar: void
  // Add other events here as needed, for example:
  // 'user:logout': void;
  // 'notification:new': { type: 'success' | 'error'; message: string };
}

/**
 * A generic type for event message callbacks.
 * It ensures that the payload passed to the callback matches the
 * structure defined in the `Events` interface for a given event.
 *
 * @template T - The event name, which must be a key of the `Events` interface.
 */
export type EventMessage<T extends keyof Events> = (payload: Events[T]) => void

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const baseEventList: { [key: string]: { call: Function; target: unknown }[] } = {}

/**
 * Defines the contract for the type-safe EventManager service.
 * This service provides methods to manage a global event bus.
 */
export interface IEventManagerService {
  /**
   * Adds a type-safe event listener for the specified event.
   * @param eventName The name of the event to listen for.
   * @param callback The function to execute when the event is emitted.
   * The payload received by the callback is strongly typed based on the event name.
   * @param target The context (e.g., component instance) to which the callback is bound.
   */
  on: <K extends keyof Events>(
    eventName: K,
    callback: (payload: Events[K]) => void,
    target?: unknown
  ) => void

  /**
   * Emits a type-safe event, triggering all registered callbacks for that event.
   * @param eventName The name of the event to emit.
   * @param payload The data to pass to the event listeners, matching the structure defined in `Events`.
   */
  emit: <K extends keyof Events>(eventName: K, payload: Events[K]) => void

  /**
   * Removes event listeners associated with a specific event name and target.
   * @param eventName The name of the event from which to remove listeners.
   * @param target The target object whose listeners for the specified event should be removed.
   */
  off: (eventName: keyof Events, target: unknown) => void

  /**
   * Removes multiple event listeners based on the provided criteria.
   * @param remove Optional criteria for removal (event name or target object).
   */
  removeAllEvent: (remove?: keyof Events | object) => void
}

export function useEventManager(): IEventManagerService {
  const on = <K extends keyof Events>(
    eventName: K,
    callback: (payload: Events[K]) => void,
    target?: unknown
  ) => {
    if (!baseEventList[eventName]) {
      baseEventList[eventName] = []
    }

    const listeners = baseEventList[eventName]!

    if (
      listeners.findIndex(
        (element) => element.target === target && element.call === callback
      ) === -1
    ) {
      listeners.push({ call: callback, target })
    } else {
      console.warn(
        `EventManager: Listener for event "${eventName}" and target already exists.`
      )
    }
  }

  const emit = <K extends keyof Events>(eventName: K, payload: Events[K]) => {
    if (baseEventList[eventName]) {
      const listeners = [...baseEventList[eventName]!]
      listeners.forEach((element) => {
        try {
          ;(element.call as (payload: Events[K]) => void).call(
            element.target,
            payload
          )
        } catch (error) {
          console.error(
            `EventManager: Error in event listener for "${eventName}":`,
            error
          )
        }
      })
    }
  }

  const off = (eventName: keyof Events, target: unknown) => {
    const listeners = baseEventList[eventName]
    if (!listeners) return

    baseEventList[eventName] = listeners.filter(
      (element) => element.target !== target
    )

    if (baseEventList[eventName]?.length === 0) {
      delete baseEventList[eventName]
    }
  }

  const removeAllEvent = (remove?: keyof Events | object | undefined) => {
    if (remove == null) {
      for (const key in baseEventList) {
        delete baseEventList[key as keyof Events]
      }
    } else if (typeof remove === 'string') {
      delete baseEventList[remove]
    } else if (typeof remove === 'object') {
      for (const eventName in baseEventList) {
        const key = eventName as keyof Events
        const listeners = baseEventList[key]
        if (listeners) {
          baseEventList[key] = listeners.filter(
            (element) => element.target !== remove
          )
          if (baseEventList[key]?.length === 0) {
            delete baseEventList[key]
          }
        }
      }
    }
  }

  return {
    on,
    emit,
    off,
    removeAllEvent,
  }
}
