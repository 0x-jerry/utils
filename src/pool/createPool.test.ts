import { createPool } from './createPool'
import { sleep } from '../core'

const fakeReq = async (n: number, time: number) => {
  const ts = time
  await sleep(ts)

  return n
}

describe('request poll', () => {
  it('max count', async () => {
    const req = createPool(fakeReq, { maximize: 4 })

    const queue: any[] = []

    for (let idx = 0; idx < 4; idx++) {
      queue.push(req(idx, 20))
    }

    const t = Date.now()
    const numbers = await Promise.all(queue)
    expect(Date.now() - t).toBeLessThan(30)
    expect(Date.now() - t).toBeGreaterThan(19)

    expect(numbers).toEqual([0, 1, 2, 3])
  })

  it('request time', async () => {
    const req = createPool(fakeReq, { maximize: 2 })

    const queue: any[] = []

    for (let idx = 0; idx < 5; idx++) {
      req(idx, 20).then((res) => {
        queue.push(res)
      })
    }

    await sleep(20)
    expect(queue).toEqual([0, 1])

    await sleep(20)
    expect(queue).toEqual([0, 1, 2, 3])

    await sleep(20)
    expect(queue).toEqual([0, 1, 2, 3, 4])
  })

  it('request failed', async () => {
    const fakeReq = async (throwError: boolean = false) => {
      await sleep(10)
      if (throwError) {
        throw new Error('error')
      }

      return 0
    }

    const req = createPool(fakeReq, { maximize: 1 })

    const r1 = req(true)
    const r2 = req()

    await expect(r1).rejects.toThrow('error')
    await expect(r2).resolves.toBe(0)
  })
})
