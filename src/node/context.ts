import { AsyncLocalStorage } from 'node:async_hooks'
import type { Awaitable, Factory } from '../types'
import { toValue } from '../utils'

type ASLStore = Map<ContextImplementSymbol, any>

let als: AsyncLocalStorage<ASLStore> | undefined

export type ContextImplementSymbol = symbol

export type ContextImplement<Value = unknown> = [ContextImplementSymbol, Value]

export interface ContextInstance<T> {
  name: string

  /**
   * Get current context
   */
  get(): T

  /**
   * Implement the context
   * @param service
   */
  impl(service: T): ContextImplement<T>
}

export type ContextRunFn = <T>(fn: () => T, serviceImplements?: ContextImplement[]) => T

export interface BindContext {
  /**
   * Run with context implements
   */
  run: ContextRunFn

  /**
    Bind the context implementations in advance

    ```ts
    const bind = Context.bind(() => [CounterService.impl({ count: 1 })])

    bind.run(() => {
      const c = CounterService.get() // c.count === 1
    })
    ```
   */
  bind: (serviceImplements?: Factory<ContextImplement[]>) => BindContext
}

export namespace Context {
  /**
    Create a context instance, then you can use the instance to get the context in async scope

    @param name Context name
    @param defaultImpl The default implement will applied if the `run` function not provide the implement
    @returns
   */
  export function create<Service>(name: string, defaultImpl?: Factory<Service>) {
    const ContextImpl: ContextInstance<Service> = {
      name,
      get() {
        const v = getAls().getStore()

        if (!v) {
          throw new Error('Please Use `Context.run` to run the main function')
        }

        const key = toContextSymbol(ContextImpl)

        if (v.has(key)) {
          return v.get(key)
        }

        if (defaultImpl) {
          const value = toValue(defaultImpl)

          v.set(key, value)
          return value
        }

        throw new Error(`Implement not found for: ${name}`)
      },
      impl(service) {
        return [toContextSymbol(ContextImpl), service]
      },
    }

    return ContextImpl
  }

  /**
    Execute a function by provide context implements, support async scope.

    @example

    ```ts
    interface CounterService {
      count: number
    }

    const CounterService = Context.create<CounterService>('counter')

    const main = () => {
      const c = CounterService.get()
      console.log(c.count) // => 1

      setTimeout(() => {
        const c1 = CounterService.get()

        console.log(c1.count) // => 1
      }, 100)
    }

    Context.run(main, [
      CounterService.impl({
        count: 1,
      }),
    ])

    ```

    @param fn
    @param serviceImplements
    @returns
   */
  export function run<T>(fn: () => T, serviceImplements?: ContextImplement[]) {
    const als = getAls()

    const ctx: ASLStore = new Map()

    for (const [key, value] of serviceImplements || []) {
      ctx.set(key, value)
    }

    return als.run(ctx, fn)
  }

  /**
    Exit the current context

    @example

    ```ts
    Context.run(() => {
      const c = CounterService.get() // Works

      Context.exit(() => {
        const c = CounterService.get() // This will throw error, because current scope is not in the context scope
      })

      const c1 = CounterService.get() // Works
    })
    ```
   */
  export function exit(fn: () => Awaitable<void>) {
    return getAls().exit(() => fn())
  }

  /**
    Bind the context implementations in advance

    ```ts
    const bind = Context.bind(() => [CounterService.impl({ count: 1 })])

    bind.run(() => {
      const c = CounterService.get() // c.count === 1
    })
    ```
   */
  export function bind(serviceImplements?: Factory<ContextImplement[]>): BindContext {
    return new BindContextImpl(serviceImplements && [serviceImplements])
  }
}

class BindContextImpl implements BindContext {
  implFactories: Factory<ContextImplement[]>[] = []

  constructor(implFactories?: Factory<ContextImplement[]>[]) {
    this.implFactories.push(...(implFactories || []))
  }

  /**
      Execute the function by context implementations
     */
  run<T>(fn: () => T, contextImplements?: ContextImplement[]) {
    const allImplements = contextImplements
      ? [...this.implFactories, contextImplements]
      : this.implFactories

    const normalizedImplements = allImplements.flatMap((f) => toValue(f))

    return Context.run(fn, normalizedImplements)
  }

  /**
      Bind the context implementations in advance

      ```ts
      const bind = Context.bind(() => [CounterService.impl({ count: 1 })])

      bind.run(() => {
        const c = CounterService.get() // c.count === 1
      })
      ```
     */
  bind: (serviceImplements?: Factory<ContextImplement[]>) => BindContext = (implFactories) => {
    const allImplements = implFactories
      ? [...this.implFactories, implFactories]
      : this.implFactories

    return new BindContextImpl(allImplements)
  }
}

function toContextSymbol(v: unknown): ContextImplementSymbol {
  return v as ContextImplementSymbol
}

function getAls() {
  return (als ??= new AsyncLocalStorage())
}
