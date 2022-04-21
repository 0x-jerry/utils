import { MessageChannel } from 'worker_threads'
import { sleep } from '../core'
import { createRPC, RPCStatusSymbol, RPCTimeoutError } from './rpc'

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

type FnA = typeof A
type FnB = typeof B

describe('rpc test', () => {
  it('remote call', async () => {
    const channel = new MessageChannel()

    const a = createRPC<FnB>(A, {
      send: (data) => channel.port1.postMessage(data),
      receive: (resolver) => channel.port1.on('message', resolver),
    })

    const b = createRPC<FnA>(B, {
      send: (data) => channel.port2.postMessage(data),
      receive: (resolver) => channel.port2.on('message', resolver),
    })

    const res = await a.pong('123')
    expect(res).toBe('pong: 123')

    const r = await b.ping('aaa')
    expect(r).toBe('ping: aaa')

    channel.port1.close()
  })

  it('remote error', async () => {
    const channel = new MessageChannel()

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

    const a = createRPC<typeof BB>(AA, {
      send: (data) => channel.port1.postMessage(data),
      receive: (resolver) => channel.port1.on('message', resolver),
      verbose: true,
    })

    const b = createRPC<typeof AA>(BB, {
      send: (data) => channel.port2.postMessage(data),
      receive: (resolver) => channel.port2.on('message', resolver),
      verbose: true,
    })

    const r1 = a.pong()
    await expect(r1).rejects.toThrow('error')
    expect(warn.mock.calls[0][0]).toBe('Error occurs when call method:')
    expect(warn.mock.calls[0][1].method).toBe('pong')

    const r2 = b.ping()
    await expect(r2).rejects.toThrow('error aa')
    expect(warn.mock.calls[1][0]).toBe('Error occurs when call method:')
    expect(warn.mock.calls[1][1].method).toBe('ping')

    channel.port1.close()
  })

  it('invalid message', async () => {
    const channel = new MessageChannel()

    const warn = vi.spyOn(console, 'warn')

    const a = createRPC<FnB>(A, {
      send: (data) => channel.port1.postMessage(data),
      receive: (resolver) => channel.port1.on('message', resolver),
      verbose: true,
    })

    const invalidMsg = { type: 's', id: '0cfd68c19', result: 'pong: 1' }
    channel.port2.postMessage(invalidMsg)
    // ensure channel message has been resolved
    await sleep(10)

    expect(warn.mock.calls[0]).eql(['Not found request:', invalidMsg])

    channel.port1.close()
  })

  it('should throw a timeout error', async () => {
    const channel = new MessageChannel()

    const a = createRPC<FnA>(B, {
      send: (data) => channel.port1.postMessage(data),
      receive: (resolver) => channel.port1.on('message', resolver),
      timeout: 10,
    })

    await expect(a.timeout(100)).rejects.toBeInstanceOf(RPCTimeoutError)

    const status = a[RPCStatusSymbol]
    expect(status.size).toBe(0)

    channel.port1.close()
  })

  it('should ignore the message send by itself', async () => {
    const channel = new MessageChannel()

    const a = createRPC<FnA>(B, {
      send: (data) => channel.port1.postMessage(data),
      receive: (resolver) => channel.port2.on('message', resolver),
      timeout: 100,
    })

    await expect(a.ping('hello')).rejects.toBeInstanceOf(RPCTimeoutError)

    channel.port1.close()

    const aa = createRPC<FnA>(B, {
      send: (data) => channel.port1.postMessage(data),
      receive: (resolver) => channel.port2.on('message', resolver),
      timeout: 100,
    })

    await expect(aa.ping('hello')).rejects.toThrow('Not found method: [ping]')

    channel.port1.close()
  })
})
