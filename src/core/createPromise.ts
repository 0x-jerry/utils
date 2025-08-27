export function createPromise<T>(): PromiseWithResolvers<T> {
  if (Promise.withResolvers) {
    return Promise.withResolvers()
  }

  type Resolve = PromiseWithResolvers<T>['resolve']
  type Reject = PromiseWithResolvers<T>['reject']

  let _resolve: Resolve
  let _reject: Reject

  const _promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve

    _reject = reject
  })

  return {
    promise: _promise,
    // biome-ignore lint/style/noNonNullAssertion: has set
    resolve: _resolve!,
    // biome-ignore lint/style/noNonNullAssertion: has set
    reject: _reject!,
  }
}
