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
    return assert(typeof t === 'number', message || `${t} should be a number.`)
  }

  export function string(t: unknown, message?: string): asserts t is string {
    return assert(typeof t === 'string', message || `${t} should be a string.`)
  }

  export function boolean(t: unknown, message?: string): asserts t is boolean {
    return assert(typeof t === 'boolean', message || `${t} should be a boolean.`)
  }

  export function fn(t: unknown, message?: string): asserts t is Function {
    return assert(typeof t === 'function', message || `${t} should be a function.`)
  }
}
