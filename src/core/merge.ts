import { isArray, isObject } from '../is'
import type { DeepPartial, DeepRequired, Optional } from '../types'

/**
 *
 * @param defaultValue
 * @param overrideValues
 * @example
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
  const result: any = {}

  for (const key in defaultValue) {
    const v = defaultValue[key]

    const mergePrimitiveLike = () => {
      const values = [v, ...overrideValues.map((n) => (n as any)?.[key])]
      return values.reduceRight((v, cur) => v ?? cur, null)
    }

    if (isPrimitiveLike(v)) {
      result[key] = mergePrimitiveLike()
    } else if (isObject(v)) {
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
