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

  const isPolling = {
    value: false,
  }

  const abort = () => {
    isManualAbort = true
  }

  const polling = async () => {
    if (isPolling.value) return

    isPolling.value = true

    const isAbort = await fn()

    await sleep(conf.timeout)

    isPolling.value = false
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
    isPolling,
    /**
     * Abort roll polling.
     */
    abort,
  }
}
