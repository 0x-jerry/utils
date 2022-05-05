import { is } from '../is'
import { Arrayable } from './types'

/**
 * Ensure return an array of element T.
 *
 * @param o
 * @returns
 */
export const toArray = <T>(o: Arrayable<T>): T[] => {
  return Array.isArray(o) ? o : [o]
}

export const remove = <T>(o: T[], predict: T | ((item: T) => boolean)): number => {
  const idx = is.fn(predict) ? o.findIndex(predict) : o.indexOf(predict)

  if (idx >= 0) o.splice(idx, 1)

  return idx
}
