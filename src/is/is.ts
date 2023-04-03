import { Ctor, PrimitiveType } from '../types'

/**
 * check target if is a Class or not.
 *
 * @param target
 * @returns
 */
export function isCls(target: unknown): target is Ctor {
  return /^\s*class/.test(String(target))
}

/**
 * check target if is a number or not
 * @param target
 * @returns
 */
export function isNumber(target: unknown): target is number {
  return typeof target === 'number'
}

/**
 * check {@link target} if is a symbol or not
 */
export function isSymbol(target: unknown): target is symbol {
  return typeof target === 'symbol'
}

/**
 * check target if is a string or not
 * @param target
 * @returns
 */
export function isString(target: unknown): target is string {
  return typeof target === 'string'
}

/**
 * if target is a boolean, or not
 * @param target
 * @returns
 */
export function isBoolean(target: unknown): target is boolean {
  return typeof target === 'boolean'
}

/**
 * return true when {@link target} is a function, but not a class.
 */
export function isFn(target: unknown): target is Function {
  return typeof target === 'function' && !isCls(target)
}

/**
 * if target is an array, or not
 * @param target
 * @returns
 */
export function isArray<T = any>(target: unknown): target is Array<T> {
  return Array.isArray(target)
}

/**
 * if target is a object and not null
 * @param target
 * @returns
 */
export function isObject(target: unknown): target is Object {
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
export function isEmpty(target: number | bigint | boolean | Function): false
export function isEmpty(target: unknown): boolean
export function isEmpty(target: unknown): boolean {
  if (isNullish(target)) {
    return true
  } else if (typeof target === 'string') {
    return target.length === 0
  } else if (target instanceof Set || target instanceof Map) {
    return target.size === 0
  } else if (isArray(target)) {
    return target.length === 0
  } else if (isPromise(target)) {
    return false
  } else if (isObject(target) && Object.keys(target).length === 0) {
    return true
  }

  return false
}

/**
 * if target is an object and iterable
 *
 * @example
 * ```ts
 * iterable([]) // => true
 * iterable('23') // => false
 * ```
 *
 * @param target
 * @returns
 */
export function isIterable<V>(target: unknown): target is Iterable<V> {
  return isObject(target) && Symbol.iterator in target
}

/**
 * if target is an object and async iterable
 *
 * @example
 * ```ts
 * const asyncIter = async function* () {
 *  yield 1
 * }
 * iterable(asyncIter) // => true
 * iterable([]) // => false
 * iterable('23') // => false
 * ```
 *
 * @param target
 * @returns
 */
export function isAsyncIterable<V>(target: unknown): target is AsyncIterable<V> {
  return isObject(target) && Symbol.asyncIterator in target
}

/**
 * if target is null or undefined
 * @param target
 * @returns
 */
export function isNullish(target: unknown): target is null | undefined {
  return target == null
}

/**
 * if target is a primitive value
 * @param target
 * @returns
 */
export function isPrimitive(target: unknown): target is PrimitiveType {
  return !isObject(target) && !isFn(target) && !isCls(target)
}

/**
 * if target is a promise
 *
 * @param target
 * @returns
 */
export function isPromise<T = unknown>(target: unknown): target is Promise<T> {
  return target instanceof Promise
}

/**
 * if target is a promise like object
 *
 * @param target
 * @returns
 */
export function isPromiseLike<T = unknown>(target: unknown): target is PromiseLike<T> {
  return isObject(target) && 'then' in target
}
