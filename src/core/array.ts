import { isFn, isPrimitive } from '../is/index.js'
import type { Arrayable, PrimitiveType } from '../types/index.js'

/**
 * Ensure to return a list of element T.
 *
 * @param arr
 * @returns
 */
export const ensureArray = <T>(arr?: Arrayable<T>): T[] => {
  if (arr == null) {
    return []
  }

  return Array.isArray(arr) ? arr : [arr]
}

export const remove = <T>(arr: T[], predict: T | ((item: T) => boolean)): number => {
  const idx = isFn(predict) ? arr.findIndex(predict) : arr.indexOf(predict)

  if (idx >= 0) arr.splice(idx, 1)

  return idx
}

type GroupResult<T, U> = U extends PrimitiveType
  ? Record<string | number | symbol, T[]>
  : Map<U, T[]>
