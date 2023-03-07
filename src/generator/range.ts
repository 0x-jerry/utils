/**
 *
 * Generate some range, eg. :
 *
 * ```ts
 * range(3) // => [0,1,2,3]
 * range(-3) // => [0,-1,-2,-3]
 * range(3, 1) // => [3,2,1]
 * range(0, 5, 2) // => [0,2,4]
 * ```
 *
 * @returns
 */
export function range(end: number): number[]
export function range(start: number, end: number): number[]
export function range(start: number, end: number, step: number): number[]
export function range(start: number, end?: number, step?: number) {
  const nums: number[] = []

  if (arguments.length === 1) {
    end = start
    start = 0
    step = start > end ? -1 : 1
  } else {
    end = end!
    step = step ?? (start > end ? -1 : 1)
  }

  let num = start

  //
  let count = 10000

  if (start > end) {
    while (num >= end && count--) {
      nums.push(num)
      num += step
    }
  } else {
    while (num <= end && count--) {
      nums.push(num)
      num += step
    }
  }

  return nums
}
