import {
  CancelledError,
  JsonRpcErrorCode,
  JsonRpcServer,
  type JsonRpcMethods,
  type JsonRpcNotifications,
  type JsonRpcOutbound,
} from './index'

interface Methods extends JsonRpcMethods {
  add: { params: [number, number]; result: number }
  echo: { params: { text: string }; result: string }
  noop: { params: undefined; result: undefined }
  fail: { params: unknown; result: never }
}
interface Notifications extends JsonRpcNotifications {
  tick: { at: number }
  ping: undefined
}

function createHarness() {
  const sent: JsonRpcOutbound[] = []
  const server = new JsonRpcServer<Methods, Notifications>((message) => sent.push(message))
  return { server, sent }
}

/** Drain the microtask queue — replies are sent asynchronously. */
async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('JsonRpcServer requests', () => {
  it('replies with the result and echoes the id', async () => {
    const { server, sent } = createHarness()
    server.onRequest('add', ([a, b]) => a + b)

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'add', params: [1, 2] })
    await flush()

    expect(sent).toHaveLength(1)
    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 1, result: 3 })
  })

  it('echoes string ids', async () => {
    const { server, sent } = createHarness()
    server.onRequest('add', ([a, b]) => a + b)

    server.handleMessage({ jsonrpc: '2.0', id: 'req-1', method: 'add', params: [1, 1] })
    await flush()

    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 'req-1', result: 2 })
  })

  it('passes params to the handler', async () => {
    const { server, sent } = createHarness()
    const handler = vi.fn(({ text }: { text: string }) => text.toUpperCase())
    server.onRequest('echo', handler)

    server.handleMessage({ jsonrpc: '2.0', id: 2, method: 'echo', params: { text: 'hi' } })
    await flush()

    expect(handler).toHaveBeenCalledWith({ text: 'hi' })
    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 2, result: 'HI' })
  })

  it('passes undefined params when the params member is omitted', async () => {
    const { server, sent } = createHarness()
    const handler = vi.fn((params: undefined) => params)
    server.onRequest('noop', handler)

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'noop' })
    await flush()

    expect(handler).toHaveBeenCalledWith(undefined)
    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 1, result: undefined })
  })

  it('supports async handlers', async () => {
    const { server, sent } = createHarness()
    server.onRequest('add', async ([a, b]) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return a + b
    })

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'add', params: [2, 3] })
    expect(sent).toHaveLength(0)
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 1, result: 5 })
  })

  it('lets the last registered handler win', async () => {
    const { server, sent } = createHarness()
    server.onRequest('add', () => 1)
    server.onRequest('add', ([a, b]) => a + b)

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'add', params: [2, 2] })
    await flush()

    expect(sent[0]).toEqual({ jsonrpc: '2.0', id: 1, result: 4 })
  })

  it('replies Method not found for unknown methods', async () => {
    const { server, sent } = createHarness()

    server.handleMessage({ jsonrpc: '2.0', id: 7, method: 'nope' })
    await flush()

    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: 7,
      error: { code: JsonRpcErrorCode.MethodNotFound, message: 'Method not found' },
    })
  })
})

describe('JsonRpcServer error replies', () => {
  it('replies Server error when a handler throws synchronously', async () => {
    const { server, sent } = createHarness()
    server.onRequest('fail', () => {
      throw new Error('boom')
    })

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'fail' })
    await flush()

    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.ServerError, message: 'boom' },
    })
  })

  it('replies Server error when an async handler rejects', async () => {
    const { server, sent } = createHarness()
    server.onRequest('fail', async () => {
      throw new Error('async boom')
    })

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'fail' })
    await flush()

    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.ServerError, message: 'async boom' },
    })
  })

  it('honors the CancelledError code (-32001)', async () => {
    const { server, sent } = createHarness()
    server.onRequest('fail', () => {
      throw new CancelledError()
    })

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'fail' })
    await flush()

    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.Cancelled, message: 'cancelled' },
    })
  })

  it('honors any code in the reserved server-error range (-32000..-32099)', async () => {
    const { server, sent } = createHarness()
    server.onRequest('fail', () => {
      const error = new Error('custom') as Error & { code?: number }
      error.code = JsonRpcErrorCode.ServerError - 99
      throw error
    })

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'fail' })
    await flush()

    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.ServerError - 99, message: 'custom' },
    })
  })

  it.each([
    ['non-numeric', 'oops'],
    ['out of range high', -31999],
    ['out of range low', -32100],
    ['spec code', JsonRpcErrorCode.MethodNotFound],
  ])('falls back to Server error for a %s code', async (_label, code) => {
    const { server, sent } = createHarness()
    server.onRequest('fail', () => {
      const error = new Error('x') as Error & { code?: unknown }
      error.code = code
      throw error
    })

    server.handleMessage({ jsonrpc: '2.0', id: 1, method: 'fail' })
    await flush()

    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: JsonRpcErrorCode.ServerError, message: 'x' },
    })
  })
})

describe('JsonRpcServer invalid requests', () => {
  const invalid: [string, unknown][] = [
    ['a top-level batch array', [1, 2]],
    ['null', null],
    ['a string', 'hi'],
    ['a number', 1],
    ['wrong version', { jsonrpc: '1.0', id: 1, method: 'x' }],
    ['missing method', { jsonrpc: '2.0', id: 1 }],
    ['null id', { jsonrpc: '2.0', id: null, method: 'x' }],
    ['boolean id', { jsonrpc: '2.0', id: true, method: 'x' }],
    ['object id', { jsonrpc: '2.0', id: {}, method: 'x' }],
  ]

  it.each(invalid)('replies Invalid Request with id null for %s', async (_label, message) => {
    const { server, sent } = createHarness()

    server.handleMessage(message)
    await flush()

    expect(sent).toHaveLength(1)
    expect(sent[0]).toEqual({
      jsonrpc: '2.0',
      id: null,
      error: { code: JsonRpcErrorCode.InvalidRequest, message: 'Invalid Request' },
    })
  })
})

describe('JsonRpcServer notifications', () => {
  it('dispatches notifications without replying', () => {
    const { server, sent } = createHarness()
    const handler = vi.fn()
    server.onNotification('tick', handler)

    server.handleMessage({ jsonrpc: '2.0', method: 'tick', params: { at: 3 } })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ at: 3 })
    expect(sent).toHaveLength(0)
  })

  it('ignores notifications without a handler', () => {
    const { server, sent } = createHarness()

    server.handleMessage({ jsonrpc: '2.0', method: 'unknown' })

    expect(sent).toHaveLength(0)
  })

  it('logs but never replies when a notification handler throws', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { server, sent } = createHarness()
    server.onNotification('tick', () => {
      throw new Error('nope')
    })

    server.handleMessage({ jsonrpc: '2.0', method: 'tick' })

    expect(error).toHaveBeenCalled()
    expect(sent).toHaveLength(0)
  })

  it('sends notifications to the client', () => {
    const { server, sent } = createHarness()

    server.notify('tick', { at: 1 })

    expect(sent[0]).toEqual({ jsonrpc: '2.0', method: 'tick', params: { at: 1 } })
    expect('id' in (sent[0] as object)).toBe(false)
  })

  it('omits params in outbound notifications when undefined', () => {
    const { server, sent } = createHarness()

    server.notify('ping', undefined)

    expect(sent[0]).toEqual({ jsonrpc: '2.0', method: 'ping' })
  })
})
