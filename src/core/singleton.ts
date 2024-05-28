import { isCls } from '../is/index.js'
import type { Ctor } from '../types/index.js'

const singletons = /*@__PURE__*/ new WeakMap<Function, unknown>()

/**
 *
 * @example
 *
 * ```ts
 * class Factory {}
 *
 * const ins1 = getInstance(Factory)
 * const ins2 = getInstance(Factory)
 *
 * console.log(ins1 === in2) // => true
 * ```
 *
 * @param factory
 * @returns
 */
export function getInstance<T>(factory: Ctor<T, []> | (() => T)): T {
  if (singletons.has(factory)) {
    return singletons.get(factory) as T
  }

  const ins = isCls(factory) ? new factory() : factory()

  singletons.set(factory, ins)

  return ins
}
