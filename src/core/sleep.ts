import { createPromise } from './createPromise.js'

export type SleepResult = Promise<void> & { cancel: () => void }

/**
 * promise timeout, support cancel
 *
 * @param timeout
 * @returns
 */
export const sleep = (timeout: number = 0): SleepResult => {
  let handler: NodeJS.Timeout | number | undefined

  const promise = createPromise<void>()

  const ins = promise.instance as SleepResult

  ins.cancel = () => {
    clearTimeout(handler)
    promise.reject('canceled')
  }

  handler = setTimeout(promise.resolve, timeout)

  return ins
}
