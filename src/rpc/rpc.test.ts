import { MessageChannel } from 'worker_threads'
import { sleep } from '../core'
import { createRPC, RPCMethods, RPCOption, RPCTimeoutError } from './rpc'
import { RPCRequest, RPCResponse } from './types'

const A = {
  ping(s: string) {
    return 'ping: ' + s
  },
  async timeout(ts: number) {
    await sleep(ts)
    return 0
  },
}

const B = {
  pong(s: string) {
    return 'pong: ' + s
  },
}

describe('rpc test', () => {
  it('remote call', async () => {
    const { a, b, channel } = createRPCPair(A, B)

    const res = await a.proxy.pong('123')
    expect(res).toBe('pong: 123')

    const r = await b!.proxy.ping('aaa')
    expect(r).toBe('ping: aaa')

    channel.port1.close()
  })

  it('remote error', async () => {
    const warn = vi.spyOn(console, 'warn')

    const AA = {
      ping() {
        throw new Error('error aa')
      },
    }

    const BB = {
      pong() {
        throw new Error('error')
      },
    }

    const { a, b, channel } = createRPCPair(AA, BB)

    const r1 = a.proxy.pong()
    await expect(r1).rejects.toThrow('error')
    expect(warn.mock.calls[0][0]).toBe('Error occurs when call method:')
    expect(warn.mock.calls[0][1].m).toBe('pong')

    const r2 = b!.proxy.ping()
    await expect(r2).rejects.toThrow('error aa')
    expect(warn.mock.calls[1][0]).toBe('Error occurs when call method:')
    expect(warn.mock.calls[1][1].m).toBe('ping')

    channel.port1.close()
  })

  it('invalid message', async () => {
    const warn = vi.spyOn(console, 'warn')

    const id = 'mf66'

    const { channel } = createRPCPair(A, B, {
      id,
    })

    const invalidMsg: RPCResponse = { _: id, t: 's', id: '0cfd68c19', r: 'pong: 1' }

    channel.port2.postMessage(invalidMsg)
    // ensure channel message has been resolved
    await sleep(10)

    expect(warn.mock.calls[0]).eql(['Not found request:', invalidMsg])

    channel.port1.close()
  })

  it('should throw a timeout error', async () => {
    const { b, channel } = createRPCPair(A, B)

    await expect(b!.proxy.timeout(100)).rejects.toBeInstanceOf(RPCTimeoutError)

    const status = b!.record
    expect(status.size).toBe(0)

    channel.port1.close()
  })

  it('should ignore the message send by itself', async () => {
    const { a, channel } = createRPCPair<typeof B, typeof A>(A)

    await expect(a.proxy.pong('hello')).rejects.toBeInstanceOf(RPCTimeoutError)

    channel.port1.close()
  })

  it('should ignore the message send by other rpc service', async () => {
    const AA = {
      ping: vi.fn(),
    }

    const id = 'mf65'
    const { channel } = createRPCPair<typeof B, typeof AA>(AA, undefined, { id })

    const selfRPCMsg: RPCRequest = { _: id, t: 'q', id: '0cfd68c11', m: 'ping', p: [] }
    channel.port2.postMessage(selfRPCMsg)
    await sleep(10)
    expect(AA.ping).toBeCalledTimes(1)

    const otherRPCMsg: RPCRequest = { _: 'mf66', t: 'q', id: '0cfd68c19', m: 'ping', p: [] }
    channel.port2.postMessage(otherRPCMsg)
    // ensure channel message has been resolved
    await sleep(10)

    expect(AA.ping).toBeCalledTimes(1)

    channel.port1.close()
  })
})

function createRPCPair<MethodsB extends RPCMethods, MethodsA extends RPCMethods>(
  A: MethodsA,
  B?: MethodsB,
  opt?: RPCOption
) {
  const channel = new MessageChannel()

  const options: RPCOption = {
    timeout: 100,
    id: Math.random().toString().slice(2),
    verbose: true,
    ...opt,
  }

  const a = createRPC<MethodsB>(A, {
    send: (d) => channel.port1.postMessage(d),
    ...options,
  })

  channel.port1.on('message', (e) => a.receive(e))

  let b
  if (B) {
    b = createRPC<MethodsA>(B, {
      send: (d) => channel.port2.postMessage(d),
      ...options,
    })

    channel.port2.on('message', b.receive)
  }

  return { a, b, channel }
}
