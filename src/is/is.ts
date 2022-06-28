import { Ctor } from '../core'

export namespace is {
  // class is a keyword, so use calsss
  export function classs(o: unknown): o is Ctor {
    return /^\s*class/.test(String(o))
  }

  export function number(o: unknown): o is number {
    return typeof o === 'number'
  }

  export function string(o: unknown): o is string {
    return typeof o === 'string'
  }

  export function boolean(o: unknown): o is boolean {
    return typeof o === 'boolean'
  }

  export function fn(o: unknown): o is Function {
    return typeof o === 'function' && !classs(o)
  }

  export function array<T = any>(o: unknown): o is Array<T> {
    return Array.isArray(o)
  }

  export function object(o: unknown): o is Object {
    return o !== null && typeof o === 'object'
  }

  export function empty(o: number | bigint | boolean | Function): false
  export function empty<V, K>(
    o: null | undefined | string | Set<V> | Map<K, V> | Array<V> | Iterable<V> | object
  ): boolean
  export function empty(o: unknown): boolean {
    if (o === null || o === undefined) {
      return true
    } else if (typeof o === 'string') {
      return !o
    } else if (o instanceof Set || o instanceof Map) {
      return o.size === 0
    } else if (o instanceof Array) {
      return o.length === 0
    } else if (iterable(o)) {
      for (const _ of o) {
        return false
      }

      return true
    } else if (object(o) && Object.keys(o).length === 0) {
      return true
    }

    return false
  }

  export function iterable<V>(o: unknown): o is Iterable<V> {
    return Symbol.iterator in Object(o)
  }

  export function nullish<T>(o: T): o is NonNullable<T> {
    return !(o != null)
  }
}
