import { createPromise } from '../core/index.js'
import type { Fn } from '../types/index.js'

export function createLatestRunner<T extends Fn>(fn: T) {
  let latestId = 0

  return {
    run,
  }

  function run(...args: Parameters<T>) {
    const p = createPromise<Awaited<ReturnType<T>>>()

    const id = ++latestId

    _run(...args)
      .then((data) => {
        if (id === latestId) {
          p.resolve(data as Awaited<ReturnType<T>>)
        }
      })
      .catch((e) => p.reject(e))

    return p.instance
  }

  async function _run(...args: Parameters<T>) {
    const resp = await fn(...args)
    return resp
  }
}
