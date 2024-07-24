import { isPromiseLike } from '../is/index.js'
import type { Fn } from '../types/utils.js'

export interface IChainable<In = unknown> {
  input: In
  fns: Fn[]
  pipe<Out>(
    fn: (i: In) => Out,
  ): Out extends Promise<unknown> ? IAsyncChainable<Out> : IChainable<Out>
  done(): In
}

export interface IAsyncChainable<In = unknown> {
  input: In
  fns: Fn[]
  pipe<Out>(fn: (i: Awaited<In>) => Out): IAsyncChainable<Out>
  done(): Promise<Awaited<In>>
}

/**
 *
 * @example
 *
 * ```ts
 * const plusOne = (n: number) => n + 1
 * const toString = (n: number) => n.toString()
 *
 * const s = chain(0)
 *  .pipe(plusOne)
 *  .pipe(toString)
 *  .done()
 *
 * console.log(s) // => '1'
 * ```
 *
 * @param input
 * @returns
 */
export function chain<T>(input: T): IChainable<T> {
  const ctx: IChainable<T> = {
    input,
    fns: [],
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    pipe: createChainable as any,
    done: done as () => T,
  }

  return ctx
}

function createChainable(this: IChainable, fn: Fn) {
  const chainCtx: IChainable = {
    input: this.input,
    fns: [...this.fns, fn],
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    pipe: createChainable as any,
    done,
  }

  return chainCtx as IChainable
}

function done(this: IChainable) {
  return this.fns.reduce((i, fn) => (isPromiseLike(i) ? i.then((x) => fn(x)) : fn(i)), this.input)
}
