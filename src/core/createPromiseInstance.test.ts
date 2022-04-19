import { createPromiseInstance, PromiseStatus } from './createPromiseInstance'

describe('createPromiseInstance', () => {
  it('resolve', async () => {
    const ins = createPromiseInstance()

    ins.resolve(1)

    await expect(ins.instance).resolves.toBe(1)
  })

  it('reject', async () => {
    const ins = createPromiseInstance()

    ins.reject('error')

    await expect(ins.instance).rejects.toBe('error')
  })

  it('should be always rejected if reject first', async () => {
    const ins = createPromiseInstance()
    expect(ins.isPending).toBe(true)
    expect(ins.status).toBe(PromiseStatus.Pending)

    ins.reject('error')
    expect(ins.isRejected).toBe(true)
    expect(ins.status).toBe(PromiseStatus.Rejected)

    ins.resolve('1')
    expect(ins.isRejected).toBe(true)
    expect(ins.status).toBe(PromiseStatus.Rejected)

    await expect(ins.instance).rejects.toBe('error')
  })

  it('should be always fulfilled if resolve first', async () => {
    const ins = createPromiseInstance()
    expect(ins.isPending).toBe(true)
    expect(ins.status).toBe(PromiseStatus.Pending)

    ins.resolve(1)
    expect(ins.isFulfilled).toBe(true)
    expect(ins.status).toBe(PromiseStatus.Fulfilled)

    ins.reject('1')
    expect(ins.isFulfilled).toBe(true)
    expect(ins.status).toBe(PromiseStatus.Fulfilled)

    await expect(ins.instance).resolves.toBe(1)
  })
})
