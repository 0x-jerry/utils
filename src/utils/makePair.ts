import { noop } from '../core'
import type { Fn, Optional } from '../types'

export interface PairConfig<T extends Fn> {
  __default?: T
  [key: string]: Optional<T>
}

/**
 * eg.
 *
 * ```ts
 * const handler = makePair({
 *  __default() {
 *    return 'cool'
 *  },
 *  100() {
 *    return 100
 *  },
 *  xxx() {
 *    return 200
 *  },
 * })
 *
 * expect(handler('100')).toEqual(100)
 * expect(handler('xxx')).toEqual(200)
 * expect(handler('hhhh')).toEqual('cool')
 * ```
 * @param config
 * @returns
 */
export function makePair<T extends Fn>(config: PairConfig<T>) {
  type In = Parameters<T>
  type Out = ReturnType<T>

  const handler = (type: string, ...args: In): Optional<Out> => {
    const fn = config[type] || config.__default || noop

    return fn(...args) as Out
  }

  return handler
}

export interface PairDictConfig<T> {
  __default?: T
  [key: string]: Optional<T>
}

/**
 * eg.
 *
 * ```ts
 * const handler = makeDictPair({
 *  __default: 'cool',
 *  100: 100,
 *  xxx: 200,
 * })
 *
 * expect(handler('100')).toEqual(100)
 * expect(handler('xxx')).toEqual(200)
 * expect(handler('200')).toEqual('cool')
 * ```
 * @param config
 * @returns
 */
export function makeDictPair<T>(config: PairDictConfig<T>) {
  const handler = (type: string): Optional<T> => {
    return config[type] || config.__default
  }

  return handler
}
