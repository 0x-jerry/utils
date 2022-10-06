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
    events: new Set<Function>(),
  }

  return function (this: any, ...args: any[]) {
    return new Promise<any>((resolve, reject) => {
      const next = () => {
        ctx.runningCount++
        ctx.events.delete(next)

        request
          .apply(this, args)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            ctx.runningCount--

            const maybeNext = ctx.events.values().next()

            !maybeNext.done && maybeNext.value()
          })
      }

      if (ctx.runningCount >= ctx.maximize) {
        ctx.events.add(next)
      } else {
        next()
      }
    })
  } as T
}
