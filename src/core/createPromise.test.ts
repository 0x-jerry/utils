import { createPromise } from './createPromise'

describe('createPromiseInstance', () => {
  it('resolve', async () => {
    const ins = createPromise()

    ins.resolve(1)

    await expect(ins.promise).resolves.toBe(1)
  })

  it('reject', async () => {
    const ins = createPromise()

    ins.reject('error')

    await expect(ins.promise).rejects.toBe('error')
  })

  it('should be always rejected if reject first', async () => {
    const ins = createPromise()

    ins.reject('error')

    await expect(ins.promise).rejects.toBe('error')
  })

  it('should be always fulfilled if resolve first', async () => {
    const ins = createPromise()

    ins.resolve(1)

    ins.reject('1')

    await expect(ins.promise).resolves.toBe(1)
  })
})
