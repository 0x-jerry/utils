import { AsyncLocalStorage } from 'node:async_hooks'
import type { Awaitable, Factory } from '../types'
import { toValue } from '../utils'

type ASLStore = Map<ContextImplementSymbol, any>

let als: AsyncLocalStorage<ASLStore> | undefined

export type ContextImplementSymbol = symbol

export type ContextImplement<Value = unknown> = [ContextImplementSymbol, Value]

export interface ContextInstance<T> {
  name: string
  get(): T
  impl(service: T): ContextImplement<T>
}

export namespace Context {
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

  export function run(fn: () => Awaitable<void>, serviceImplements?: ContextImplement[]) {
    const p = Promise.withResolvers<void>()

    const ctx: ASLStore = new Map()

    getAls().run(ctx, async () => {
      const v = getAls().getStore()!

      for (const [key, value] of serviceImplements || []) {
        v.set(key, value)
      }

      try {
        await fn()
        p.resolve()
      } catch (err) {
        p.reject(err)
      }
    })

    return p.promise
  }

  export function exit(fn: () => Awaitable<void>) {
    return getAls().exit(() => fn())
  }
}

function toContextSymbol(v: unknown): ContextImplementSymbol {
  return v as ContextImplementSymbol
}

function getAls() {
  return (als ??= new AsyncLocalStorage())
}
