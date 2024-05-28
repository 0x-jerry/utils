import type { MakeEnum } from '../types/utils.js'

export interface PromiseInstance<T = any> {
  readonly status: PromiseStatus
  readonly isPending: boolean
  readonly isFulfilled: boolean
  readonly isRejected: boolean

  instance: Promise<T>
  resolve: (data: T | PromiseLike<T>) => void
  reject: (reason: any) => void
}

export const PromiseStatus = {
  Pending: 'pending',
  Fulfilled: 'fulfilled',
  Rejected: 'rejected',
} as const

export type PromiseStatus = MakeEnum<typeof PromiseStatus>

export function createPromise<T>(): PromiseInstance<T> {
  type Resolve = (value: T | PromiseLike<T>) => void
  type Reject = (reason?: any) => void

  let _resolve: Resolve, _reject: Reject

  let _status: PromiseStatus = PromiseStatus.Pending

  const p = new Promise<T>((resolve, reject) => {
    _resolve = (v) => {
      if (_status !== PromiseStatus.Pending) return

      _status = PromiseStatus.Fulfilled
      resolve(v)
    }

    _reject = (r) => {
      if (_status !== PromiseStatus.Pending) return

      _status = PromiseStatus.Rejected

      reject(r)
    }
  })

  return {
    get status() {
      return _status
    },
    get isPending() {
      return _status === PromiseStatus.Pending
    },
    get isFulfilled() {
      return _status === PromiseStatus.Fulfilled
    },
    get isRejected() {
      return _status === PromiseStatus.Rejected
    },
    instance: p,
    resolve: _resolve!,
    reject: _reject!,
  }
}
