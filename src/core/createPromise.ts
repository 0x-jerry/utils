export interface PromiseInstance<T = unknown> {
  readonly isPending: boolean
  readonly isFulfilled: boolean
  readonly isRejected: boolean

  instance: Promise<T>
  resolve: (data: T | PromiseLike<T>) => void
  reject: (reason: unknown) => void
}

enum PromiseStatus {
  Pending = 0,
  Fulfilled = 1,
  Rejected = 2,
}

export function createPromise<T>(): PromiseInstance<T> {
  type Resolve = (value: T | PromiseLike<T>) => void
  type Reject = (reason?: unknown) => void

  let _resolve: Resolve
  let _reject: Reject

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
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    resolve: _resolve!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    reject: _reject!,
  }
}
