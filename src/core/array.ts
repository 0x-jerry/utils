import { isFn, isPrimitive } from '../is'
import { Arrayable, PrimitiveType } from '../types'

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

/**
 * @deprecated use {@link ensureArray} instead of.
 */
export const toArray = ensureArray

export const remove = <T>(arr: T[], predict: T | ((item: T) => boolean)): number => {
  const idx = isFn(predict) ? arr.findIndex(predict) : arr.indexOf(predict)

  if (idx >= 0) arr.splice(idx, 1)

  return idx
}

type GroupResult<T, U> = U extends PrimitiveType
  ? Record<string | number | symbol, T[]>
  : Map<U, T[]>

/**
 *
 * @experiment
 * @param arr
 * @param callbackFn
 * @returns
 */
export function group<T, U>(arr: T[], callbackFn: (item: T) => U): GroupResult<T, U> {
  let record: any = null

  let recordIsMap = false

  function initRecord(value: any) {
    if (isPrimitive(value)) {
      record = {}
    } else {
      recordIsMap = true
      record = new Map()
    }
  }

  for (const item of arr) {
    const value = callbackFn(item)

    if (!record) initRecord(value)

    const exist = recordIsMap ? record.get(value) : record[value]

    if (exist) {
      exist.push(item)
    } else {
      const g = [item]

      if (recordIsMap) {
        record.set(value, g)
      } else {
        record[value] = g
      }
    }
  }

  return record || new Map()
}
