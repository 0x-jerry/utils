import { createMessageChannelAdaptor } from './adaptor'
import { createRPCClient, createRPCServer } from './core'

describe('rpc', () => {
  const m = new MessageChannel()

  const testMethods = {
    ping() {
      return 'ping'
    },
    add(...n: number[]) {
      return n.reduce((pre, n) => pre + n, 0)
    },
    error() {
      throw new Error('error')
    },
    deep: {
      minus(a: number, b: number) {
        return a - b
      },
    },
  }

  const s = createRPCServer({
    adaptor: createMessageChannelAdaptor(m.port1),
    methods: testMethods,
  })

  const c = createRPCClient<typeof testMethods>({
    adaptor: createMessageChannelAdaptor(m.port2),
  })

  it('should receive data', async () => {
    const r = await c.ping()

    expect(r).toBe('ping')
    expect(await c.add(1, 2, 3)).toBe(6)
  })

  it('should reject when throw error', async () => {
    const e = c.error()

    await expect(e).rejects.toBe(String(Error('error')))
  })

  it('should work with deep object', async () => {
    expect(await c.deep.minus(4, 2)).toBe(2)
  })
})
