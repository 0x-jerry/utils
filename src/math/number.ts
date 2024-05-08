import { isString } from '../is/index.js'

/**
 * like {@link Number.prototype.toFixed}, but return a number instead of string.
 * @param num
 * @param fractionDigits
 * @returns
 */
export function toFixed(num: number | string, fractionDigits: number): number {
  num = isString(num) ? parseFloat(num) : num

  return parseFloat(num.toFixed(fractionDigits))
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
  const u = Math.pow(10, fractionDigits)

  // 1207.411 / 100
  return toFixed(Math.round(value * u) / u, fractionDigits)
}

/**
 * convert value to the range [start, end]
 *
 * @param value
 * @param start
 * @param end
 * @returns
 */
export function toRange(value: number, start: number, end: number): number {
  if (start >= end) {
    throw new Error('start should less than the end')
  }

  const range = end - start

  value = Math.floor(start / range) * range + (value % range)

  if (value < start) {
    value += range
  }

  return value
}
