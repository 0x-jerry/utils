const Once = Symbol()

interface ListenerFunction {
  (...args: any[]): any
  [Once]?: boolean
}

type Listeners<R extends Record<string, unknown>> = {
  [K in keyof R]?: Set<R[K]>
}

export class EventEmitter<Events extends Record<string, ListenerFunction>> {
  static SymbolOnce = Once

  #listeners: Listeners<Events>
  #limit: number

  /**
   * Limit count of listeners for every event.
   */
  get limit() {
    return this.#limit
  }

  constructor(limit = 20) {
    this.#limit = limit
    this.#listeners = {}
  }

  #checkLimit(size: number) {
    if (size >= this.#limit) {
      throw new Error('Listeners reached limit size: ' + this.#limit)
    }
  }

  /**
   * Get all events and it's listeners.
   */
  events<K extends keyof Events>(): Listeners<Events>
  /**
   * Get all listeners of the event.
   * @param event Event type
   */
  events<K extends keyof Events>(event: K): NonNullable<Listeners<Events>[K]>
  events<K extends keyof Events>(
    event?: K
  ): Listeners<Events> | NonNullable<Listeners<Events>[K]> {
    if (!event) {
      return this.#listeners
    }

    if (!this.#listeners[event]) {
      this.#listeners[event] = new Set()
    }

    return this.#listeners[event]!
  }

  /**
   * Add a callback to the specified event.
   * @param event Event type
   * @param listener Callback
   * @returns Remove the callback.
   */
  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
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
  once<K extends keyof Events>(event: K, listener: Events[K]) {
    const events = this.events(event)

    this.#checkLimit(events.size)

    listener[Once] = true
    events.add(listener)

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
  off<K extends keyof Events>(event: K, listener: Events[K]): boolean
  off<K extends keyof Events>(event?: K, listener?: Events[K]): boolean {
    if (!event) {
      this.#listeners = {}
      return true
    }

    if (!listener) {
      delete this.#listeners[event]
      return true
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
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>) {
    const events = this.events(event)
    const clears: Events[K][] = []

    events.forEach((event) => {
      try {
        event(...args)
      } catch (error) {
        console.warn('Invoke function error:', error)
      }

      if (event[Once]) {
        delete event[Once]
        clears.push(event)
      }
    })

    clears.forEach((event) => {
      events.delete(event)
    })
  }
}
