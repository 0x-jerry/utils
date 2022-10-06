/**
 * calculate the sum of arr
 *
 * @param arr
 * @returns
 */
export function sumOf(...arr: number[]): number {
  return arr.reduce((v, s) => v + s, 0)
}
