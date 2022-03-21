export function createPromiseInstance<T>() {
  type Resolve = (value: T | PromiseLike<T>) => void
  type Reject = (reason?: any) => void

  let _resolve: Resolve, _reject: Reject

  const p = new Promise<T>((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  return {
    instance: p,
    resolve: _resolve!,
    reject: _reject!
  }
}