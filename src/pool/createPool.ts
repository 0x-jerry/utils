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
export function createPool<T extends (...arg: any[]) => Promise<any>>(
  request: T,
  opt: Partial<PoolOption> = {}
): T {
  const ctx = {
    maximize: opt.maximize ?? 10,
    runningCount: 0,
    queue: Array<() => void>(),
  }

  return function (this: any, ...args: any[]) {
    return new Promise<any>((resolve, reject) => {
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
