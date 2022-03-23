import { createPromiseInstance } from './createPromiseInstance'

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
})
