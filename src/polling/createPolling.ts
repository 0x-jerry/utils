import { sleep } from '../core'

interface PollingOption {
  /**
   *
   * @default 500
   */
  timeout?: number
}

/**
 *
 * @param fn
 * @param opt
 * @returns
 */
export function createPolling(fn: () => any | Promise<any>, opt?: PollingOption) {
  const conf: Required<PollingOption> = Object.assign(
    {
      timeout: 500,
    },
    opt
  )

  let isManualAbort = false

  let _isPolling = false

  const abort = () => {
    isManualAbort = true
  }

  const polling = async () => {
    if (_isPolling) return

    _isPolling = true

    const isAbort = await fn()

    await sleep(conf.timeout)

    _isPolling = false
    if (isAbort || isManualAbort) return

    polling()
  }

  const startPolling = () => {
    isManualAbort = false
    polling()
  }

  return {
    /**
     * Start roll polling.
     */
    polling: startPolling,
    /**
     *
     */
    get isPolling() {
      return _isPolling
    },
    /**
     * Abort roll polling.
     */
    abort,
  }
}
