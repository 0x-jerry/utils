// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Listener<T extends unknown[] = any> = (...args: T) => void

export type EventListenersMap<R extends Record<string, unknown[]>> = {
  [K in keyof R]?: Map<Listener<R[K]>, number>
}

enum Flag {
  None = 0,
  On = 1,
  Once = 1 << 1,
}

/**
 * @example
 * ```ts
 * type Events = {
 *  test: []
 *  foo: [a: number]
 *  bar: [a: number, b: string]
 * }
 *
 * const event = new EventEmitter<Events>()
 *
 * event.on('test', () => console.log('test'))
 *
 * event.emit('test')
 *
 * event.off('test')
 *
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export class EventEmitter<Events extends Record<string, any>> {
  #listeners: EventListenersMap<Events>
  #capacity: number

  /**
   * Limit count of listeners for every event.
   */
  get capacity() {
    return this.#capacity
  }

  /**
   *
   * @param capacity default is 0, means unlimited.
   */
  constructor(capacity = 0) {
    this.#capacity = capacity
    this.#listeners = {}
  }

  #checkLimit(size: number) {
    if (this.#capacity && size >= this.#capacity) {
      throw new Error(`Listeners reached limit size: ${this.#capacity}`)
    }
  }

  /**
   * Get all events and it's listeners.
   */
  #events<K extends keyof Events>(): EventListenersMap<Events>
  /**
   * Get all listeners of the event.
   * @param event Event type
   */
  #events<K extends keyof Events>(event: K): NonNullable<EventListenersMap<Events>[K]>
  #events<K extends keyof Events>(
    event?: K,
  ): EventListenersMap<Events> | NonNullable<EventListenersMap<Events>[K]> {
    if (!event) {
      return this.#listeners
    }

    if (!this.#listeners[event]) {
      this.#listeners[event] = new Map()
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return this.#listeners[event]!
  }

  events(): { [K in keyof Events]?: Listener<Events[K]>[] }
  events<K extends keyof Events>(event: K): NonNullable<Listener<Events[K]>[]>
  /**
   * Get all listeners of the event.
   * @param event Event type
   */
  events<K extends keyof Events>(event?: K): unknown {
    if (!event) {
      const keys = Object.keys(this.#listeners) as K[]
      return Object.fromEntries(keys.map((key) => [key, this.events(key)]))
    }

    const events = this.#events(event)

    return [...events.keys()]
  }

  /**
   * Add a callback to the specified event.
   * @param event Event type
   * @param listener Callback
   * @returns Remove the callback.
   */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const events = this.#events(event)

    this.#checkLimit(events.size)

    const flag = events.get(listener) || Flag.None
    events.set(listener, flag | Flag.On)

    return () => this.off(event, listener)
  }

  /**
   * Add a callback to the specified event, only execute once.
   *
   * @param event Event type
   * @param listener Callback
   * @returns Remove the callback.
   */
  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    const events = this.#events(event)

    this.#checkLimit(events.size)

    const flag = events.get(listener) || Flag.None
    events.set(listener, flag | Flag.Once)

    return () => this.off(event, listener)
  }

  /**
   * Remove all listeners of all events.
   */
  off<K extends keyof Events>(): boolean
  /**
   *
   * Remove all listeners of the event.
   * @param event Event type
   */
  off<K extends keyof Events>(event: K): boolean
  /**
   * Remove the listener of the event.
   *
   * @param event Event type
   * @param listener  Callback
   * @returns Return true if listener is existed, otherwise return false.
   */
  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): boolean
  off<K extends keyof Events>(event?: K, listener?: Listener<Events[K]>): boolean {
    if (!event) {
      const collections: Set<Listener>[] = Object.values(this.#listeners)

      this.#listeners = {}
      return collections.length > 0
    }

    if (!listener) {
      const events = this.#listeners[event]
      if (events) {
        delete this.#listeners[event]
      }

      return (events?.size || 0) > 0
    }

    const events = this.#events(event)

    return events.delete(listener)
  }

  /**
   * Trigger the event by event type.
   *
   * @param event Event type
   * @param args Arguments that apply to the callback.
   */
  emit<K extends keyof Events>(event: K, ...args: Events[K]) {
    const events = this.#events(event)
    const clears: Listener<Events[K]>[] = []

    for (const [listener, flag] of events) {
      try {
        listener(...args)
      } catch (error) {
        console.error(error)
      }

      if (flag & Flag.Once) {
        if (flag & Flag.On) {
          events.set(listener, Flag.On)
        } else {
          clears.push(listener)
        }
      }
    }

    for (const event of clears) {
      events.delete(event)
    }
  }
}
