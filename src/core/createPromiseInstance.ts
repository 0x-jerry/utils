export interface PromiseInstance<T = any> {
  readonly status: PromiseStatus
  readonly isPending: boolean
  readonly isFulfilled: boolean
  readonly isRejected: boolean

  instance: Promise<T>
  resolve: (data: T | PromiseLike<T>) => void
  reject: (reason: any) => void
}

export enum PromiseStatus {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export function createPromiseInstance<T>(): PromiseInstance<T> {
  type Resolve = (value: T | PromiseLike<T>) => void
  type Reject = (reason?: any) => void

  let _resolve: Resolve, _reject: Reject

  let _status = PromiseStatus.Pending

  const p = new Promise<T>((resolve, reject) => {
    _resolve = (v) => {
      _status = PromiseStatus.Fulfilled
      resolve(v)
    }

    _reject = (r) => {
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
