/**
 * calculate the sum of arr
 *
 * @param arr
 * @returns
 */
export function sum(...arr: number[]): number {
  return arr.reduce((v, s) => v + s, 0)
}

/**
 * @deprecated use {@link sum} instead of.
 */
export const sumOf = sum
