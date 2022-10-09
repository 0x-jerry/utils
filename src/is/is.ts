import { Ctor, PrimitiveType } from '../core'

export namespace is {
  /**
   * check target if is a Class or not.
   *
   * @param target
   * @returns
   */
  export function classs(target: unknown): target is Ctor {
    return /^\s*class/.test(String(target))
  }

  /**
   * check target if is a number or not
   * @param target
   * @returns
   */
  export function number(target: unknown): target is number {
    return typeof target === 'number'
  }

  /**
   * check target if is a string or not
   * @param target
   * @returns
   */
  export function string(target: unknown): target is string {
    return typeof target === 'string'
  }

  /**
   * if target is a boolean, or not
   * @param target
   * @returns
   */
  export function boolean(target: unknown): target is boolean {
    return typeof target === 'boolean'
  }

  /**
   * return true when {@link target} is a function, but not a class.
   */
  export function fn(target: unknown): target is Function {
    return typeof target === 'function' && !classs(target)
  }

  /**
   * if target is an array, or not
   * @param target
   * @returns
   */
  export function array<T = any>(target: unknown): target is Array<T> {
    return Array.isArray(target)
  }

  /**
   * if target is a object and not null
   * @param target
   * @returns
   */
  export function object(target: unknown): target is Object {
    return target !== null && typeof target === 'object'
  }

  /**
   * - if target is array or Set or Map, check if it's size is 0
   * - if target is iterable, check if it has any iterative item
   * - if target is object, check if it has any properties
   * - if target is null or undefined, return true
   * - other wise, return false
   * @param target
   */
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

  /**
   * if target is iterable
   * @param target
   * @returns
   */
  export function iterable<V>(target: unknown): target is Iterable<V> {
    return is.object(target) && Symbol.iterator in target
  }

  /**
   * if target is null or undefined
   * @param target
   * @returns
   */
  export function nullish<T>(target: T): target is NonNullable<T> {
    return !(target != null)
  }

  /**
   * if target is a primitive value
   * @param target
   * @returns
   */
  export function primitive(target: unknown): target is PrimitiveType {
    return !is.object(target) && !is.fn(target) && !is.classs(target)
  }
}
