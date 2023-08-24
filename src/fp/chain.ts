import { isPromiseLike } from '../is'

export interface IChainable<In = any> {
  input: In
  fns: Function[]
  pipe<Out>(fn: (i: In) => Out): Out extends Promise<any> ? IAsyncChainable<Out> : IChainable<Out>
  done(): In
}

export interface IAsyncChainable<In = any> {
  input: In
  fns: Function[]
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
  const ctx: IChainable = {
    input,
    fns: [] as Function[],
    pipe: createChainable,
    done,
  }

  return ctx
}

function createChainable(this: IChainable, fn: Function) {
  const chainCtx: IChainable = {
    input: this.input,
    fns: [...this.fns, fn],
    pipe: createChainable,
    done,
  }

  return chainCtx as any
}

function done(this: IChainable) {
  return this.fns.reduce((i, fn) => (isPromiseLike(i) ? i.then((x) => fn(x)) : fn(i)), this.input)
}
