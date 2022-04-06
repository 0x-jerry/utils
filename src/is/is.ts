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
}
