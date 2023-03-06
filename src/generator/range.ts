/**
 *
 * Generate some range, eg. :
 *
 * ```ts
 * range(0, 3) // => [0,1,2]
 * range(3, 0) // => [3,2,1]
 * range(0, 5, 2) // => [0,2,4]
 * ```
 *
 * @param end
 * @param start
 * @param step
 * @returns
 */
export function range(start: number, end: number, step?: number) {
  const nums: number[] = []

  step = step ?? (start > end ? -1 : 1)

  let num = start

  //
  let count = 10000

  if (start > end) {
    while (num > end && count--) {
      nums.push(num)
      num += step
    }
  } else {
    while (num < end && count--) {
      nums.push(num)
      num += step
    }
  }

  return nums
}
