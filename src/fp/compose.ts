import type { Fn } from '../types'
import type { ICompose, IComposeResult } from './types'

/**
 * Compose multiple functions into single function
 *
 * @example
 *
 * ```ts
 * const plusOne = (n: number) => n + 1
 * const toString = (n: number) => n.toString()
 *
 * const plusOneThenToString = compose(plusOne, toString)
 * plusOneThenToString(0) // '1'
 * ```
 *
 * @param fns
 * @returns
 */
export const compose: ICompose = (...fns: Fn[]) => {
  const composed: IComposeResult<Fn> = (x: unknown) => fns.reduce((p, fn) => fn(p), x)

  composed.exec = composed

  return composed
}
