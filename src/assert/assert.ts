import { Ctor } from '../core'
import { is } from '../is'

/**
 * Assert function, like the one in node.
 *
 * @param condition
 * @param message
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export namespace assert {
  export function number(t: unknown, message?: string): asserts t is number {
    return assert(is.number(t), message || `${t} should be a number.`)
  }

  export function string(t: unknown, message?: string): asserts t is string {
    return assert(is.string(t), message || `${t} should be a string.`)
  }

  export function boolean(t: unknown, message?: string): asserts t is boolean {
    return assert(is.boolean(t), message || `${t} should be a boolean.`)
  }

  export function fn(t: unknown, message?: string): asserts t is Function {
    return assert(is.fn(t), message || `${t} should be a function.`)
  }

  export function classs(t: unknown, message?: string): asserts t is Ctor {
    return assert(is.classs(t), message || `${t} should be a class.`)
  }

  export function array<T = any>(t: unknown, message?: string): asserts t is Array<T> {
    return assert(is.array(t), message || `${t} should be an array.`)
  }
}
