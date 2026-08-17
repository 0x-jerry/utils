import {
  JsonRpcClient,
  JsonRpcErrorCode,
  JSON_RPC_VERSION,
  isCancelledError,
  type JsonRpcMethods,
  type JsonRpcNotifications,
  type JsonRpcOutbound,
} from './index'
import { JsonRpcServer } from './server'

interface Methods extends JsonRpcMethods {
  add: { params: [number, number]; result: number }
  echo: { params: { text: string }; result: string }
  noop: { params: undefined; result: undefined }
}
interface Notifications extends JsonRpcNotifications {
  tick: { at: number }
}

function createHarness() {
  const sent: JsonRpcOutbound[] = []
  const client = new JsonRpcClient<Methods, Notifications>((message) => sent.push(message))
  return { client, sent }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('JsonRpcClient.call', () => {
  it('sends a request and resolves with the correlated result', async () => {
    const { client, sent } = createHarness()

    const promise = client.call('add', [1, 2])
    expect(sent[0]).toEqual({
      jsonrpc: JSON_RPC_VERSION,
      id: 1,
      method: 'add',
      params: [1, 2],
    })

    client.handleMessage({ jsonrpc: '2.0', id: 1, result: 3 })
    await expect(promise).resolves.toBe(3)
  })

  it('omits the params member when params are undefined', async () => {
    const { client, sent } = createHarness()

    client.call('noop')
    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 1, method: 'noop' })
    expect('params' in (sent[0] as object)).toBe(false)
  })

  it('sends falsy params', async () => {
    const { client, sent } = createHarness()

    client.call('add', [0, -1])
    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 1, method: 'add', params: [0, -1] })
  })

  it('increments ids across calls', () => {
    const { client, sent } = createHarness()

    client.call('add', [1, 1])
    client.call('echo', { text: 'hi' })
    client.call('add', [2, 2])

    expect(sent[0]).toMatchObject({ id: 1 })
    expect(sent[1]).toMatchObject({ id: 2 })
    expect(sent[2]).toMatchObject({ id: 3 })
  })

  it('rejects with the error message and code from the error object', async () => {
    const { client } = createHarness()

    const promise = client.call('add', [1, 2])
    client.handleMessage({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.InvalidParams, message: 'bad params' },
    })

    await expect(promise).rejects.toMatchObject({
      message: 'bad params',
      code: JsonRpcErrorCode.InvalidParams,
    })
  })

  it('keeps the code when the error has no numeric code', async () => {
    const { client } = createHarness()

    const promise = client.call('add', [1, 2])
    client.handleMessage({ jsonrpc: '2.0', id: 1, error: { message: 'boom' } })

    const error = await promise.catch((value: unknown) => value)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('boom')
    expect('code' in (error as object)).toBe(false)
  })

  it('surfaces cancellation as a CancelledError-compatible rejection', async () => {
    const { client } = createHarness()

    const promise = client.call('add', [1, 2])
    client.handleMessage({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.Cancelled, message: 'cancelled' },
    })

    const error = await promise.catch((value: unknown) => value)
    expect(isCancelledError(error)).toBe(true)
  })

  it('correlates responses by id even when they arrive out of order', async () => {
    const { client } = createHarness()

    const first = client.call('add', [1, 2])
    const second = client.call('echo', { text: 'x' })

    client.handleMessage({ jsonrpc: '2.0', id: 2, result: 'x' })
    client.handleMessage({ jsonrpc: '2.0', id: 1, result: 3 })

    await expect(second).resolves.toBe('x')
    await expect(first).resolves.toBe(3)
  })

  it('ignores responses for unknown ids with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { client } = createHarness()

    client.handleMessage({ jsonrpc: '2.0', id: 99, result: 1 })

    expect(warn).toHaveBeenCalled()
    expect(client._pending.size).toBe(0)
  })

  it('ignores responses with a null id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { client } = createHarness()

    client.handleMessage({
      jsonrpc: '2.0',
      id: null,
      error: { code: JsonRpcErrorCode.InvalidRequest, message: 'Invalid Request' },
    })

    expect(warn).toHaveBeenCalled()
  })
})

describe('JsonRpcClient.notify', () => {
  it('sends a notification without an id member', () => {
    const { client, sent } = createHarness()

    client.notify('tick', { at: 1 })

    expect(sent[0]).toEqual({ jsonrpc: '2.0', method: 'tick', params: { at: 1 } })
    expect('id' in (sent[0] as object)).toBe(false)
  })

  it('omits params when undefined', () => {
    const { client, sent } = createHarness()

    client.notify('tick')

    expect(sent[0]).toEqual({ jsonrpc: '2.0', method: 'tick' })
  })
})

describe('JsonRpcClient notifications routing', () => {
  it('routes inbound notifications to registered handlers', () => {
    const { client } = createHarness()
    const handler = vi.fn()

    client.onNotification('tick', handler)
    client.handleMessage({ jsonrpc: '2.0', method: 'tick', params: { at: 5 } })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ at: 5 })
  })

  it('stops routing after offNotification', () => {
    const { client } = createHarness()
    const handler = vi.fn()

    client.onNotification('tick', handler)
    client.offNotification('tick')
    client.handleMessage({ jsonrpc: '2.0', method: 'tick', params: { at: 6 } })

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('JsonRpcClient.handleMessage', () => {
  it('warns on unexpected messages', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { client } = createHarness()

    client.handleMessage('nope')

    expect(warn).toHaveBeenCalled()
  })
})

describe('JsonRpcClient.dispose', () => {
  it('rejects every in-flight call with the given error', async () => {
    const { client } = createHarness()
    const first = client.call('add', [1, 2])
    const second = client.call('echo', { text: 'x' })
    const error = new Error('transport closed')

    client.dispose(error)

    await expect(first).rejects.toBe(error)
    await expect(second).rejects.toBe(error)
    expect(client._pending.size).toBe(0)
  })

  it('uses a default error message', async () => {
    const { client } = createHarness()
    const promise = client.call('add', [1, 2])

    client.dispose()

    await expect(promise).rejects.toMatchObject({ message: 'JSON-RPC client disposed' })
  })

  it('drops notification handlers', () => {
    const { client } = createHarness()
    const handler = vi.fn()

    client.onNotification('tick', handler)
    client.dispose()
    client.handleMessage({ jsonrpc: '2.0', method: 'tick' })

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('client/server round-trip', () => {
  it('drives a call and a notification across the channel', async () => {
    const receivedByClient: unknown[] = []
    let client!: JsonRpcClient<Methods, Notifications>
    const server = new JsonRpcServer<Methods, Notifications>((message) =>
      client.handleMessage(message),
    )
    client = new JsonRpcClient<Methods, Notifications>((message) => {
      server.handleMessage(message)
      receivedByClient.push(message)
    })

    const add = vi.fn(([a, b]: [number, number]) => a + b)
    server.onRequest('add', add)
    server.onRequest('echo', ({ text }) => text.toUpperCase())
    server.onNotification('tick', vi.fn())

    await expect(client.call('add', [2, 3])).resolves.toBe(5)
    await expect(client.call('echo', { text: 'hi' })).resolves.toBe('HI')

    client.notify('tick', { at: 1 })
    expect(receivedByClient).toHaveLength(3)
    expect(receivedByClient[2]).toEqual({ jsonrpc: '2.0', method: 'tick', params: { at: 1 } })
  })
})
