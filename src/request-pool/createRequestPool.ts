import { EventEmitter } from '../events'

export interface RequestPoolOption {
  /**
   * @default 10
   */
  max: number
}

type RequestPoolEvents = {
  next(): void
}

interface RequestPoolContext {
  count: number
  event: EventEmitter<RequestPoolEvents>
}

export function createRequestPool<T extends (...arg: any[]) => Promise<any>>(
  request: T,
  opt: Partial<RequestPoolOption> = {}
): T {
  const option: RequestPoolOption = Object.assign({ max: 5 }, opt)

  const ctx: RequestPoolContext = {
    count: 0,
    event: new EventEmitter(0),
  }

  return function (this: any, ...args: any[]) {
    return new Promise<any>((resolve, reject) => {
      const next = async () => {
        if (ctx.count >= option.max) return

        ctx.count++
        ctx.event.off('next', next)

        try {
          const res = await request.apply(this, args)
          resolve(res)
        } catch (error) {
          reject(error)
        }

        ctx.count--
        ctx.event.emit('next')
      }

      if (ctx.count < option.max) {
        next()
      } else {
        ctx.event.on('next', next)
      }
    })
  } as T
}
