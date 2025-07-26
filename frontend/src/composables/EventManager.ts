// PATH: apps/client/src/composables/EventManager.ts

// This interface is already defined in your code.
// For clarity, if the callback type is standardized, it could be:
// export interface eventobject {
//   call: (...args: any[]) => void; // Standardized callback signature
//   target: any;
// }
// However, your existing `eventobject` with `call: Function` will also work with the composable.

/**
 * Defines the contract for the EventManager service.
 * This service provides methods to manage a global event bus.
 */
export interface IEventManagerService {
  /**
   * Adds an event listener for the specified event.
   * @param eventName The name of the event to listen for.
   * @param callback The function to execute when the event is emitted.
   * It will receive any arguments passed during the emit call.
   * @param target The context (e.g., component instance) to which the callback is bound.
   * This target is also used to identify the listener for removal.
   */
  on: (eventName: string, callback: (...args: unknown[]) => void, target?: unknown) => void

  /**
   * Emits an event, triggering all registered callback functions for that event.
   * @param eventName The name of the event to emit.
   * @param args Optional arguments to pass to each listener's callback function.
   */
  emit: (eventName: string, ...args: unknown[]) => void

  /**
   * Removes event listeners associated with a specific event name and target.
   * @param eventName The name of the event from which to remove listeners.
   * @param target The target object whose listeners for the specified event should be removed.
   */
  off: (eventName: string, target: unknown) => void

  /**
   * Removes multiple event listeners based on the provided criteria.
   * @param remove Optional.
   * - If a `string` is provided, all listeners for that event name are removed.
   * - If an `object` (target) is provided, all listeners associated with that target
   * are removed across all events.
   * - If `undefined` (or no argument is passed), all event listeners for all events
   * are removed (use with caution).
   */
  removeAllEvent: (remove?: string | object) => void
}

// Your existing eventobject interface
export interface eventobject {
  call: (...args: unknown[]) => void
  target: unknown
}

// This will be shared across all uses of the composable, effectively making it a global event bus.
const baseEventList: { [key: string]: eventobject[] } = {}

export function useEventManager(): IEventManagerService {
  /**
   * Adds an event listener.
   * @param eventName The name of the event.
   * @param callback The callback function to execute.
   * @param target The context (usually the calling instance, for correct `this` in callback and for removing listeners).
   */
  const on = (eventName: string, callback: (...args: unknown[]) => void, target?: unknown) => {
    // ... (rest of your existing implementation)
    if (!baseEventList[eventName]) {
      baseEventList[eventName] = []
    }
    if (
      baseEventList[eventName].findIndex(
        (element) => element.target === target && element.call === callback
      ) === -1
    ) {
      const eventObj: eventobject = {
        call: callback,
        target: target,
      }
      baseEventList[eventName].push(eventObj)
    } else {
      console.warn(`EventManager: Listener for event "${eventName}" and target already exists.`)
    }
  }

  /**
   * Emits an event, calling all registered listeners.
   * @param eventName The name of the event to emit.
   * @param args Arguments to pass to the callback functions.
   */
  const emit = (eventName: string, ...args: unknown[]) => {
    // ... (rest of your existing implementation)
    if (baseEventList[eventName]) {
      const listeners = [...baseEventList[eventName]]
      listeners.forEach((element) => {
        try {
          element.call.apply(element.target, args)
        } catch (error) {
          console.error(`EventManager: Error in event listener for "${eventName}":`, error)
        }
      })
    }
  }

  /**
   * Removes event listeners for a specific event and target.
   * @param eventName The name of the event.
   * @param target The target whose listeners should be removed.
   */
  const off = (eventName: string, target: unknown) => {
    // ... (rest of your existing implementation)
    if (!baseEventList[eventName]) {
      return
    }
    const initialLength = baseEventList[eventName].length
    baseEventList[eventName] = baseEventList[eventName].filter(
      (element) => element.target !== target
    )

    if (baseEventList[eventName].length === initialLength) {
      // console.warn(`EventManager: No listeners found for target on event "${eventName}" to remove.`);
    }

    if (baseEventList[eventName].length === 0) {
      delete baseEventList[eventName]
    }
  }

  /**
   * Removes all event listeners.
   * @param remove Optional. If a string, removes all listeners for that event name.
   * If an object, removes all listeners associated with that target.
   * If undefined, removes all listeners for all events (use with caution).
   */
  const removeAllEvent = (remove?: string | object | undefined) => {
    // Your implementation uses 'any' for target here
    // ... (rest of your existing implementation)
    if (remove == null) {
      Object.keys(baseEventList).forEach((key) => delete baseEventList[key])
    } else if (typeof remove === 'string') {
      delete baseEventList[remove]
    } else if (typeof remove === 'object') {
      // This check correctly identifies targets
      for (const eventName in baseEventList) {
        baseEventList[eventName] = baseEventList[eventName].filter(
          (element) => element.target !== remove
        )
        if (baseEventList[eventName].length === 0) {
          delete baseEventList[eventName]
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
