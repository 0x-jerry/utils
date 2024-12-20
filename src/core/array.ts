import { isFn } from '../is'
import type { Arrayable } from '../types'

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

export const remove = <T>(arr: T[], predicate: T | ((item: T, index: number) => boolean)): T[] => {
  const removed: T[] = []

  if (isFn(predicate)) {
    for (let idx = 0; idx < arr.length; idx++) {
      const shouldRemove = predicate(arr[idx], idx)

      if (shouldRemove) {
        removed.push(...arr.splice(idx, 1))
        idx--
      }
    }
  } else {
    const idx = arr.indexOf(predicate)

    if (idx >= 0) {
      removed.push(...arr.splice(idx, 1))
    }
  }

  return removed
}
