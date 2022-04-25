import { is } from '../is'

interface LRUOptions {
  /**
   * @default 500
   */
  limit: number
  /**
   * @default 1d
   */
  maxAge: number
}

interface Node<K = unknown, V = unknown> {
  key: K
  value: V

  age: number
  create: number

  previous?: Node<K, V>
  next?: Node<K, V>
}

class NodeImplement<K, V> implements Node<K, V> {
  key: K
  value: V

  age: number
  create: number

  constructor(key: K, value: V, age: number) {
    this.key = key
    this.value = value
    this.age = age
    this.create = new Date().getTime()
  }

  previous?: Node<K, V>
  next?: Node<K, V>
}

/**
 * Least Recently Used
 *
 * O(1)
 */
export class LRU<Key = string, Value = unknown> {
  _cache = new Map<Key, Node<Key, Value>>()
  _tail?: Node<Key, Value>
  _lead?: Node<Key, Value>

  readonly limit: number
  readonly maxAge: number

  _oldestKey?: Key

  constructor(option: Partial<LRUOptions> = {}) {
    this.limit = option.limit ?? 500
    this.maxAge = option.maxAge ?? 24 * 60 * 60 * 1000

    if (this.limit <= 0) {
      throw new Error('option.limit should be greater than 0')
    }
  }

  set(key: Key, value: Value): void {
    if (this._cache.has(key)) {
      const node = this._cache.get(key)!
      node.value = value
      this.touchExistOne(node)

      return
    }

    // new node
    const node = new NodeImplement(key, value, this.maxAge)

    if (this._cache.size === 0) {
      this._lead = node
      this._tail = node
      this._cache.set(node.key, node)

      return
    }

    if (this._cache.size === this.limit) {
      this._cache.delete(this._tail!.key)
      this._tail = this._tail?.previous || node

      if (this._tail) {
        this._tail!.next = undefined
      }

      this._lead!.previous = node
      node.next = this._lead
      this._lead = node

      this._cache.set(node.key, node)
      return
    }

    this._lead!.previous = node
    node.next = this._lead
    this._lead = node

    this._cache.set(node.key, node)
  }

  get(key: Key): Value | undefined {
    if (!this._cache.has(key)) {
      return
    }

    const node = this._cache.get(key)!

    if (isExpire(node)) {
      this._cache.delete(node.key)

      if (node.previous && node.next) {
        node.previous.next = node.next
        node.next.previous = node.previous
      } else if (node.previous) {
        this._tail = node.previous
        this._tail.next = undefined
      } else {
        this.reset()
      }

      return
    }

    this.touchExistOne(node)

    return node.value
  }

  touchExistOne(node: Node<Key, Value>) {
    node.create = Date.now()

    if (node.next && node.previous) {
      node.next.previous = node.previous
      node.previous.next = node.next

      this._lead!.previous = node

      node.next = this._lead
      node.previous = undefined

      this._lead = node
      return
    }

    if (node.previous) {
      node.previous.next = undefined
      this._tail = node.previous

      this._lead!.previous = node

      node.next = this._lead
      node.previous = undefined

      this._lead = node
      return
    }
  }

  reset() {
    this._cache.clear()
    this._lead = undefined
    this._tail = undefined
  }
}

function isExpire(item: Node<unknown, unknown>, now: number = Date.now()) {
  return now - item.create > item.age
}
