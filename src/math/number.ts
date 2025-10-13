import { isString } from '../is'

/**
 * like {@link Number.prototype.toFixed}, but return a number instead of string.
 * @param num
 * @param fractionDigits
 * @returns
 */
export function toFixed(num: number | string, fractionDigits: number): number {
  const _num = isString(num) ? Number.parseFloat(num) : num

  return Number.parseFloat(_num.toFixed(fractionDigits))
}

/**
 * ensure value is between [min, max].
 *
 * @param value
 * @param min
 * @param max
 * @returns
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/**
 * like {@link Math.round}, but support specify fraction digits.
 * @param value
 * @param fractionDigits
 * @returns
 */
export function round(value: number, fractionDigits: number): number {
  const u = 10 ** fractionDigits

  // 1207.411 / 100
  return toFixed(Math.round(value * u) / u, fractionDigits)
}

/**
 * Convert value to the range [start, end)
 *
 * @param value
 * @param start
 * @param end
 * @returns
 */
export function normalizeToRange(value: number, start: number, end: number): number {
  if (start >= end) {
    throw new Error('start should less than the end')
  }

  const range = end - start

  return ((((value - start) % range) + range) % range) + start
}
