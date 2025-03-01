import { createPromise } from './createPromise'

describe('createPromiseInstance', () => {
  it('resolve', async () => {
    const ins = createPromise()

    ins.resolve(1)

    await expect(ins.instance).resolves.toBe(1)
  })

  it('reject', async () => {
    const ins = createPromise()

    ins.reject('error')

    await expect(ins.instance).rejects.toBe('error')
  })

  it('should be always rejected if reject first', async () => {
    const ins = createPromise()
    expect(ins.isPending).toBe(true)

    ins.reject('error')
    expect(ins.isRejected).toBe(true)

    ins.resolve('1')
    expect(ins.isRejected).toBe(true)

    await expect(ins.instance).rejects.toBe('error')
  })

  it('should be always fulfilled if resolve first', async () => {
    const ins = createPromise()
    expect(ins.isPending).toBe(true)

    ins.resolve(1)
    expect(ins.isFulfilled).toBe(true)

    ins.reject('1')
    expect(ins.isFulfilled).toBe(true)

    await expect(ins.instance).resolves.toBe(1)
  })
})
