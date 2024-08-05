import { isFn } from '../is/index.js'
import type { Arrayable } from '../types/index.js'

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
