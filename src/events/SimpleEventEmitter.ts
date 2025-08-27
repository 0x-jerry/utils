import type { Listener } from './types'

export class SimpleEventEmitter<Args extends unknown[] = []> {
  #listeners = new Set<Listener<Args>>()

  on(listener: Listener<Args>) {
    this.#listeners.add(listener)

    return () => this.off(listener)
  }

  off(listener: Listener<Args>) {
    this.#listeners.delete(listener)
  }

  clear() {
    this.#listeners.clear()
  }

  emit(...args: Args) {
    this.#listeners.forEach((listener) => listener(...args))
  }
}
