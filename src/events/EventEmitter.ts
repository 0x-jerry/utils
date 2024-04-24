type Listener<T extends any[] = any[]> = (...args: T) => void

type EventListenersMap<R extends Record<string, any[]>> = {
  [K in keyof R]?: Set<Listener<R[K]>>
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
export class EventEmitter<Events extends Record<string, any>> {
  #listeners: EventListenersMap<Events>
  #capacity: number
  #once = new Map<keyof Events, Set<Listener>>()

  /**
   * Limit count of listeners for every event.
   */
  get capacity() {
    return this.#capacity
  }

  /**
   *
   * @param capacity default is 0, means unlimited.
   * @param opt
   */
  constructor(capacity = 0) {
    this.#capacity = capacity
    this.#listeners = {}
  }

  #checkLimit(size: number) {
    if (this.#capacity && size >= this.#capacity) {
      throw new Error('Listeners reached limit size: ' + this.#capacity)
    }
  }

  /**
   * Get all events and it's listeners.
   */
  events<K extends keyof Events>(): EventListenersMap<Events>
  /**
   * Get all listeners of the event.
   * @param event Event type
   */
  events<K extends keyof Events>(event: K): NonNullable<EventListenersMap<Events>[K]>
  events<K extends keyof Events>(
    event?: K
  ): EventListenersMap<Events> | NonNullable<EventListenersMap<Events>[K]> {
    if (!event) {
      return this.#listeners
    }

    if (!this.#listeners[event]) {
      this.#listeners[event] = new Set()
    }

    return this.#listeners[event]!
  }

  #removeOnceMark<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    const collection = this.#once.get(event)
    return collection?.delete(listener)
  }

  #addOnceMark<K extends keyof Events>(event: K, listener: Listener): void {
    const collection = this.#once.get(event)

    if (collection) {
      collection.add(listener)
    } else {
      this.#once.set(event, new Set([listener]))
    }
  }

  /**
   * Add a callback to the specified event.
   * @param event Event type
   * @param listener Callback
   * @returns Remove the callback.
   */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const events = this.events(event)

    this.#checkLimit(events.size)

    events.add(listener)

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
    const events = this.events(event)

    this.#checkLimit(events.size)

    events.add(listener)
    this.#addOnceMark(event, listener)

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

    const events = this.events(event)

    return events.delete(listener)
  }

  /**
   * Trigger the event by event type.
   *
   * @param event Event type
   * @param args Arguments that apply to the callback.
   */
  emit<K extends keyof Events>(event: K, ...args: Events[K]) {
    const events = this.events(event)
    const clears: Listener<Events[K]>[] = []

    events.forEach((listener) => {
      try {
        listener(...args)
      } catch (error) {
        console.error(error)
      }

      if (this.#removeOnceMark(event, listener)) {
        clears.push(listener)
      }
    })

    clears.forEach((event) => events.delete(event))
  }
}
