import { sleep } from '../core'
import { createLatestRunner } from './createLatetRunner'

describe('latest runner', () => {
  it('should only resolve the latest promise', async () => {
    let i = 0

    const fn = vi.fn(async (ts = 100) => {
      i++

      await sleep(ts)

      return i
    })

    const runner = createLatestRunner(fn)

    let res = -1

    runner.run(100).then((n) => (res = n))
    runner.run(200).then((n) => (res = n))
    runner.run(10).then((n) => (res = n))

    await sleep(240)

    expect(fn).toBeCalledTimes(3)

    expect(res).toBe(3)
  })
})
