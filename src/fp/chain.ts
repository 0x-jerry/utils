import { isPromiseLike } from '..'

export interface IChainable<In = any> {
  input: In
  fns: Function[]
  pipe<Out>(fn: (i: In) => Out): IChainable<Out>
  done(): In
}

export function chain<T>(input: T): IChainable<T> {
  const ctx: IChainable = {
    input,
    fns: [] as Function[],
    pipe: createChainable,
    done,
  }

  return ctx

  function createChainable(this: IChainable, fn: Function): IChainable {
    const chainCtx: IChainable = {
      input: this.input,
      fns: [...this.fns],
      pipe: createChainable,
      done,
    }

    chainCtx.fns.push(fn)

    return chainCtx
  }

  function done(this: IChainable): T {
    return this.fns.reduce((i, fn) => fn(i), this.input)
  }
}

const add1 = chain(3).pipe(async (n) => n + 1)

const toStr = add1.pipe((n) => n.toString() + 1)

console.log(add1.done(), toStr.done())
