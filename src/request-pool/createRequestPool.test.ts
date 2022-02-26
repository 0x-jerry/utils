import { createRequestPool } from './createRequestPool'
import { sleep } from '../core'

const fakeReq = async (n: number, time: number) => {
  const ts = time
  await sleep(ts)

  return n
}

describe('request poll', () => {
  it('max count', async () => {
    const req = createRequestPool(fakeReq, { max: 4 })

    const queue: any[] = []

    for (let idx = 0; idx < 4; idx++) {
      queue.push(req(idx, 200))
    }

    const t = Date.now()
    const numbers = await Promise.all(queue)
    expect(Date.now() - t).toBeLessThan(300)
    expect(Date.now() - t).toBeGreaterThan(199)

    expect(numbers).toEqual([0, 1, 2, 3])
  })

  it('request time', async () => {
    const req = createRequestPool(fakeReq, { max: 2 })

    const queue: any[] = []

    for (let idx = 0; idx < 5; idx++) {
      req(idx, 200).then((res) => {
        queue.push(res)
      })
    }

    await sleep(200)
    expect(queue).toEqual([0, 1])

    await sleep(200)
    expect(queue).toEqual([0, 1, 2, 3])

    await sleep(200)
    expect(queue).toEqual([0, 1, 2, 3, 4])
  })
})
