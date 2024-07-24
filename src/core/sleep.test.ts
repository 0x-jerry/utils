import { sleep } from './sleep.js'

describe('sleep', () => {
  it('cancel sleep', async () => {
    let v = 1
    const p = sleep()

    p.then(() => {
      v = 2
    }).catch(() => {
      v = 3
    })

    expect(v).toBe(1)
    p.cancel()
    await sleep()
    expect(v).toBe(3)
  })
})
