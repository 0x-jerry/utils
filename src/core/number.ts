import { is } from '../is'

/**
 * like {@link Number.prototype.toFixed}, but return a number instead of string.
 * @param num
 * @param fractionDigits
 * @returns
 */
export function toFixed(num: number | string, fractionDigits: number): number {
  num = is.number(num) ? num : +num

  return +num.toFixed(fractionDigits)
}

/**
 *
 * @param value
 * @param min
 * @param max
 * @returns
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}
