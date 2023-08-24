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
