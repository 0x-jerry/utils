import { sleep } from './sleep'

describe('sleep', () => {
  it('wait 200 ms', async () => {
    const test = () => {
      return new Promise<void>((done) => {
        let v = 0
        sleep(200).then(() => (v = 1))
        expect(v).toBe(0)

        setTimeout(() => {
          expect(v).toBe(1)
          done()
        }, 210)
      })
    }

    return test()
  })

  it('cancel sleep', async () => {
    let v = 1
    const p = sleep(10)

    p.then(() => (v = 2)).catch(() => (v = 3))

    expect(v).toBe(1)
    p.cancel()
    await sleep()
    expect(v).toBe(3)
  })
})
