import { Fn } from '../types'
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
export const compose: ICompose = (...fns: Fn[]) => {
  const composed: IComposeResult<Fn> = (x: unknown) => fns.reduce((p, fn) => fn(p), x)

  composed.exec = composed

  return composed
}

/**
 *
 * @deprecated use `chain` instead of.
 *
 * like {@link compose}, but use `pipe` style
 *
 * @example
 *
 * ```ts
 * const plusOne = (n: number) => n + 1
 * const toString = (n: number) => n.toString()
 *
 * input(0).pipe(plusOne).pipe(toString).exec() // '1'
 * ```
 *
 * @param input
 * @returns
 */
export const input = <I>(input: I) => new Pipeline<I, I>((i) => i, input)

class Pipeline<Output, Input> {
  #fn: Fn<Output, [Input]>
  #input: Input

  constructor(fn: Fn<Output, [Input]>, input: Input) {
    this.#fn = fn
    this.#input = input
  }

  pipe<NextOutput>(fn: Fn<NextOutput, [Output]>) {
    return new Pipeline(compose(this.#fn, fn), this.#input)
  }

  exec() {
    return this.#fn(this.#input)
  }
}
