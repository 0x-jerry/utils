import { isCls } from '../is'
import { Ctor } from '../types'

const singletons = new WeakMap<Function, unknown>()

/**
 *
 * @example
 *
 * ```ts
 * class Factory {}
 *
 * const createInstance = () => createSingleton(Factory)
 *
 * const ins1 = createInstance()
 * const ins2 = createInstance()
 * // ins1 === in2
 * ```
 *
 * @param factory
 * @returns
 */
export function createSingleton<T>(factory: Ctor<T, []> | (() => T)): T {
  if (singletons.has(factory)) {
    return singletons.get(factory) as T
  }

  const ins = isCls(factory) ? new factory() : factory()

  singletons.set(factory, ins)

  return ins
}
