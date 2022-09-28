import { Ctor, PrimitiveType } from '../core'

export namespace is {
  // class is a keyword, so use calsss
  export function classs(target: unknown): target is Ctor {
    return /^\s*class/.test(String(target))
  }

  export function number(target: unknown): target is number {
    return typeof target === 'number'
  }

  export function string(target: unknown): target is string {
    return typeof target === 'string'
  }

  export function boolean(target: unknown): target is boolean {
    return typeof target === 'boolean'
  }

  /**
   * return true when {@link target} is a function, but not a class.
   */
  export function fn(target: unknown): target is Function {
    return typeof target === 'function' && !classs(target)
  }

  export function array<T = any>(target: unknown): target is Array<T> {
    return Array.isArray(target)
  }

  export function object(target: unknown): target is Object {
    return target !== null && typeof target === 'object'
  }

  export function empty(target: number | bigint | boolean | Function): false
  export function empty<V, K>(
    target: null | undefined | string | Set<V> | Map<K, V> | Array<V> | Iterable<V> | object
  ): boolean
  export function empty(target: unknown): boolean {
    if (target === null || target === undefined) {
      return true
    } else if (typeof target === 'string') {
      return !target
    } else if (target instanceof Set || target instanceof Map) {
      return target.size === 0
    } else if (target instanceof Array) {
      return target.length === 0
    } else if (iterable(target)) {
      for (const _ of target) {
        return false
      }

      return true
    } else if (object(target) && Object.keys(target).length === 0) {
      return true
    }

    return false
  }

  export function iterable<V>(target: unknown): target is Iterable<V> {
    return Symbol.iterator in Object(target)
  }

  export function nullish<T>(target: T): target is NonNullable<T> {
    return !(target != null)
  }

  export function primitive(target: unknown): target is PrimitiveType {
    return !is.object(target) && !is.fn(target) && !is.classs(target)
  }
}
