import { MessageChannel } from 'worker_threads'
import { createRPC } from './rpc'

const A = {
  ping(s: string) {
    return 'ping: ' + s
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
})
