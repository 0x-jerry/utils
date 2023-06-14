import { createPromise } from '../core'
import { Fn } from '../types'

export function createLatestRunner<T extends Fn>(fn: Fn) {
  let latestId = 0

  return {
    run,
  }

  function run(...args: Parameters<T>) {
    const p = createPromise<Awaited<ReturnType<Fn>>>()

    const id = ++latestId

    _run(...args)
      .then((data) => {
        if (id === latestId) {
          p.resolve(data)
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
