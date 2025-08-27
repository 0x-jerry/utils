import { createPromise } from './createPromise'

export type SleepResult = Promise<void> & { cancel: () => void }

/**
 * promise timeout, support cancel
 *
 * @param timeout
 * @returns
 */
export function sleep(timeout = 0): SleepResult {
  // biome-ignore lint/style/useConst: false positive
  let handler: NodeJS.Timeout | number | undefined

  const promise = createPromise<void>()

  const ins = promise.promise as SleepResult

  ins.cancel = () => {
    clearTimeout(handler)
    promise.reject('canceled')
  }

  handler = setTimeout(promise.resolve, timeout)

  return ins
}
