import { Fn } from '../core'
import { ICompose, IComposeResult } from './types'

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
export const compose: ICompose = (...fns: any[]) => {
  const composed: IComposeResult<Fn> = (x: any) => fns.reduce((p, fn) => fn(p), x)

  composed.exec = composed

  return composed as any
}
