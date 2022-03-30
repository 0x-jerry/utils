import { ref } from '@vue/reactivity'
import { sleep } from '../core'

export interface PollingOption {
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

  const _isPolling = ref(false)

  const abort = () => {
    isManualAbort = true
  }

  const polling = async () => {
    if (_isPolling.value) return

    _isPolling.value = true

    const isAbort = await fn()

    await sleep(conf.timeout)

    _isPolling.value = false
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
      return _isPolling.value
    },
    /**
     * Abort roll polling.
     */
    abort,
  }
}
