import { sleep } from './sleep'

describe('sleep', () => {
  it('wait 200 ms', (done) => {
    let v = 0
    sleep(200).then(() => (v = 1))

    setTimeout(() => {
      expect(v).toBe(1)
      done()
    }, 210)
  })
})
