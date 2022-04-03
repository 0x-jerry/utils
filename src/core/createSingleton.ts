import { isClass } from './is'
import { Ctor } from './types'

const singletons = new WeakMap<Function, unknown>()

export function createSingleton<T>(factory: Ctor<T, []> | (() => T)): T {
  if (singletons.has(factory)) {
    return singletons.get(factory) as T
  }

  const ins = isClass(factory) ? new factory() : factory()

  singletons.set(factory, ins)

  return ins
}
