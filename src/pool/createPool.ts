import { createPromise } from '../core'
import type { Fn } from '../types'

export interface PoolOption {
  /**
   * @default 10
   */
  maximize: number
}

/**
 * create a simple request pool, it will limit the max request count.
 *
 * @param request
 * @param opt
 * @returns
 */

export function createPool<T extends Fn>(request: T, opt: Partial<PoolOption> = {}) {
  const ctx = {
    maximize: opt.maximize ?? 10,
    runningCount: 0,
    queue: [] as Array<() => void>,
  }

  return function (this: unknown, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    const { promise, reject, resolve } = createPromise<Awaited<ReturnType<T>>>()

    const nextReq = () => {
      ctx.runningCount++

      invokeToPromise(() => request.apply(this, args) as Awaited<ReturnType<T>>)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          ctx.runningCount--

          const maybeNextReq = ctx.queue.shift()

          maybeNextReq?.()
        })
    }

    if (ctx.runningCount >= ctx.maximize) {
      ctx.queue.push(nextReq)
    } else {
      nextReq()
    }

    return promise
  }
}

// biome-ignore lint/suspicious/noExplicitAny: internal usage
async function invokeToPromise<T extends () => any>(fn: T): Promise<ReturnType<T>> {
  return fn()
}
