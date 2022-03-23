import { createPolling } from './createPolling'
import { sleep } from '../core'

describe('createPolling', () => {
  it('start polling', async () => {
    const fn = vi.fn()

    const polling = createPolling(fn, { timeout: 10 })

    polling.polling()
    expect(fn).toBeCalledTimes(1)

    polling.abort()
    await sleep(20)
  })

  it('stop polling', async () => {
    const fn = vi.fn()

    const polling = createPolling(fn, { timeout: 10 })

    polling.polling()
    expect(fn).toBeCalledTimes(1)

    await sleep(30)

    expect(fn).toBeCalledTimes(3)

    polling.abort()
    await sleep(20)

    expect(fn).toBeCalledTimes(3)
  })

  it('is polling', async () => {
    const fn = vi.fn()

    const polling = createPolling(fn, { timeout: 10 })

    polling.polling()
    polling.polling()
    expect(polling.isPolling).toBe(true)
    expect(fn).toBeCalledTimes(1)

    polling.abort()
    await sleep(20)

    expect(fn).toBeCalledTimes(1)
  })
})
