import { createPromiseInstance } from './createPromiseInstance'

export type SleepResult = Promise<void> & { cancel: () => void }

export const sleep = (timeout: number): SleepResult => {
  let handler: NodeJS.Timeout | number | undefined

  const ins = createPromiseInstance<void>()

  const p = ins.instance as SleepResult

  p.cancel = () => {
    clearTimeout(handler)
    ins.reject('canceled')
  }

  handler = setTimeout(ins.resolve, timeout)

  return p
}
