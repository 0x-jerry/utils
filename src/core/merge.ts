import { isArray, isObject } from '../is/index.js'
import type { DeepPartial, DeepRequired, Optional } from '../types/index.js'

/**
 *
 * @param defaultValue
 * @param overrideValues
 * @example
 * @deprecated will remove in the next major version
 *
 * ```ts
 * deepMerge({
 *  a: 1,
 *  b: '',
 *  c: false,
 *  d: [1],
 *  e: {
 *    a: new Set([1, 2]),
 *    b: new Map([[1, 1]]),
 *  },
 * },
 * {
 *  a: 2,
 *  b: '2',
 *  c: true,
 * },
 * {
 *  e: {
 *    a: new Set([2]),
 *  },
 * },
 * {
 *  e: {
 *    b: new Map([[2, 2]]),
 *  },
 * })
 * ```
 */
export function deepMerge<T extends {}>(
  defaultValue: T,
  ...overrideValues: Optional<DeepPartial<T>>[]
): DeepRequired<T> {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const result: any = {}

  for (const key in defaultValue) {
    const v = defaultValue[key]

    const mergePrimitiveLike = () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const values = [v, ...overrideValues.map((n) => (n as any)?.[key])]
      return values.reduceRight((v, cur) => v ?? cur, null)
    }

    if (isPrimitiveLike(v)) {
      result[key] = mergePrimitiveLike()
    } else if (isObject(v)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      result[key] = deepMerge(v, ...overrideValues.map((n) => (n as any)?.[key]))
    } else {
      result[key] = mergePrimitiveLike()
    }
  }

  return result
}

function isPrimitiveLike(v: unknown): boolean {
  const factories = [Map, Set, WeakMap, WeakSet]

  return isArray(v) || !!factories.find((t) => v instanceof t)
}
