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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function createPool<T extends (...arg: any[]) => Promise<any>>(
  request: T,
  opt: Partial<PoolOption> = {},
): T {
  const ctx = {
    maximize: opt.maximize ?? 10,
    runningCount: 0,
    queue: Array<() => void>(),
  }

  return function (this: unknown, ...args: unknown[]) {
    return new Promise((resolve, reject) => {
      const nextReq = () => {
        ctx.runningCount++

        request
          .apply(this, args)
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
    })
  } as T
}
