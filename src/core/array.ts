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
