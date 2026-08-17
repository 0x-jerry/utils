import {
  CancelledError,
  JSON_RPC_VERSION,
  JsonRpcErrorCode,
  createJsonRpcIdGenerator,
  hasOwn,
  isCancelledError,
  isJsonRpcNotification,
  isJsonRpcRequest,
  isJsonRpcResponse,
  isRequestId,
  jsonRpcErrorMessage,
} from './core'

describe('JSON_RPC_VERSION', () => {
  it('is 2.0', () => {
    expect(JSON_RPC_VERSION).toBe('2.0')
  })
})

describe('JsonRpcErrorCode', () => {
  it('defines the spec pre-defined codes (§5.1)', () => {
    expect(JsonRpcErrorCode.ParseError).toBe(-32700)
    expect(JsonRpcErrorCode.InvalidRequest).toBe(-32600)
    expect(JsonRpcErrorCode.MethodNotFound).toBe(-32601)
    expect(JsonRpcErrorCode.InvalidParams).toBe(-32602)
    expect(JsonRpcErrorCode.InternalError).toBe(-32603)
    expect(JsonRpcErrorCode.ServerError).toBe(-32000)
    expect(JsonRpcErrorCode.Cancelled).toBe(-32001)
  })
})

describe('jsonRpcErrorMessage', () => {
  it('maps pre-defined codes to their standard messages', () => {
    expect(jsonRpcErrorMessage(JsonRpcErrorCode.ParseError)).toBe('Parse error')
    expect(jsonRpcErrorMessage(JsonRpcErrorCode.InvalidRequest)).toBe('Invalid Request')
    expect(jsonRpcErrorMessage(JsonRpcErrorCode.MethodNotFound)).toBe('Method not found')
    expect(jsonRpcErrorMessage(JsonRpcErrorCode.InvalidParams)).toBe('Invalid params')
    expect(jsonRpcErrorMessage(JsonRpcErrorCode.InternalError)).toBe('Internal error')
  })

  it('falls back to a generic message for unknown codes', () => {
    expect(jsonRpcErrorMessage(JsonRpcErrorCode.ServerError)).toBe('Server error (-32000)')
    expect(jsonRpcErrorMessage(123)).toBe('Server error (123)')
  })
})

describe('CancelledError', () => {
  it('carries the -32001 code and a sensible name', () => {
    const error = new CancelledError()

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('CancelledError')
    expect(error.code).toBe(JsonRpcErrorCode.Cancelled)
    expect(error.message).toBe('cancelled')
  })

  it('accepts a custom message', () => {
    expect(new CancelledError('stopped by user').message).toBe('stopped by user')
  })
})

describe('isCancelledError', () => {
  it('recognizes CancelledError instances', () => {
    expect(isCancelledError(new CancelledError())).toBe(true)
  })

  it('recognizes any Error carrying the -32001 code', () => {
    const error = new Error('x') as Error & { code?: number }
    error.code = JsonRpcErrorCode.Cancelled

    expect(isCancelledError(error)).toBe(true)
  })

  it('rejects other errors and non-errors', () => {
    expect(isCancelledError(new Error('x'))).toBe(false)
    expect(isCancelledError(null)).toBe(false)
    expect(isCancelledError(undefined)).toBe(false)
    expect(isCancelledError({ code: JsonRpcErrorCode.Cancelled })).toBe(false)
  })
})

describe('createJsonRpcIdGenerator', () => {
  it('produces incrementing ids starting at 1', () => {
    const next = createJsonRpcIdGenerator()

    expect(next()).toBe(1)
    expect(next()).toBe(2)
    expect(next()).toBe(3)
  })

  it('keeps generators independent', () => {
    const a = createJsonRpcIdGenerator()
    const b = createJsonRpcIdGenerator()

    a()
    expect(b()).toBe(1)
  })
})

describe('hasOwn', () => {
  it('only reports own properties', () => {
    const value = Object.create({ inherited: 1 })
    value.own = 2

    expect(hasOwn(value, 'own')).toBe(true)
    expect(hasOwn(value, 'inherited')).toBe(false)
    expect(hasOwn(value, 'missing')).toBe(false)
  })
})

describe('isRequestId', () => {
  it('accepts strings, numbers and null (§4)', () => {
    expect(isRequestId('a')).toBe(true)
    expect(isRequestId(0)).toBe(true)
    expect(isRequestId(-1)).toBe(true)
    expect(isRequestId(1.5)).toBe(true)
    expect(isRequestId(null)).toBe(true)
  })

  it('rejects everything else', () => {
    expect(isRequestId(undefined)).toBe(false)
    expect(isRequestId(true)).toBe(false)
    expect(isRequestId({})).toBe(false)
    expect(isRequestId([])).toBe(false)
  })
})

describe('isJsonRpcResponse', () => {
  it('recognizes success responses', () => {
    expect(isJsonRpcResponse({ jsonrpc: '2.0', id: 1, result: 42 })).toBe(true)
    expect(isJsonRpcResponse({ jsonrpc: '2.0', id: 'a', result: null })).toBe(true)
    expect(isJsonRpcResponse({ jsonrpc: '2.0', id: 1, result: undefined })).toBe(true)
  })

  it('recognizes error responses, including id null and data', () => {
    expect(
      isJsonRpcResponse({
        jsonrpc: '2.0',
        id: null,
        error: { code: JsonRpcErrorCode.MethodNotFound, message: 'Method not found' },
      }),
    ).toBe(true)
    expect(
      isJsonRpcResponse({
        jsonrpc: '2.0',
        id: 1,
        error: { code: JsonRpcErrorCode.ServerError, message: 'x', data: { a: 1 } },
      }),
    ).toBe(true)
  })

  it('requires exactly one of result/error', () => {
    expect(isJsonRpcResponse({ jsonrpc: '2.0', id: 1 })).toBe(false)
    expect(
      isJsonRpcResponse({
        jsonrpc: '2.0',
        id: 1,
        result: 1,
        error: { code: 1, message: 'x' },
      }),
    ).toBe(false)
  })

  it('rejects malformed payloads', () => {
    const bad: unknown[] = [
      { jsonrpc: '2.0', result: 42 }, // missing id
      { jsonrpc: '2.0', id: true, result: 1 }, // invalid id
      { jsonrpc: '2.0', id: 1, error: 'nope' }, // error not an object
      { jsonrpc: '1.0', id: 1, result: 1 }, // wrong version
      { jsonrpc: '2.0', id: 1, result: 1, extra: true }, // extra members are tolerated
    ]
    // Note: extra members are tolerated by the spec — keep that case out.
    expect(isJsonRpcResponse(bad[4])).toBe(true)
    for (const value of bad.slice(0, 4)) {
      expect(isJsonRpcResponse(value)).toBe(false)
    }

    expect(isJsonRpcResponse(null)).toBe(false)
    expect(isJsonRpcResponse(undefined)).toBe(false)
    expect(isJsonRpcResponse('x')).toBe(false)
    expect(isJsonRpcResponse(1)).toBe(false)
    expect(isJsonRpcResponse([])).toBe(false)
  })
})

describe('isJsonRpcRequest', () => {
  it('recognizes requests with string or number ids', () => {
    expect(isJsonRpcRequest({ jsonrpc: '2.0', id: 1, method: 'm' })).toBe(true)
    expect(isJsonRpcRequest({ jsonrpc: '2.0', id: 'a', method: 'm', params: [] })).toBe(true)
  })

  it('rejects null ids, notifications and malformed payloads', () => {
    expect(isJsonRpcRequest({ jsonrpc: '2.0', id: null, method: 'm' })).toBe(false)
    expect(isJsonRpcRequest({ jsonrpc: '2.0', method: 'm' })).toBe(false) // notification
    expect(isJsonRpcRequest({ jsonrpc: '2.0', id: 1 })).toBe(false) // missing method
    expect(isJsonRpcRequest({ jsonrpc: '2.0', id: 1, method: 123 })).toBe(false)
    expect(isJsonRpcRequest({ jsonrpc: '1.0', id: 1, method: 'm' })).toBe(false)

    expect(isJsonRpcRequest(null)).toBe(false)
    expect(isJsonRpcRequest(1)).toBe(false)
    expect(isJsonRpcRequest('x')).toBe(false)
    expect(isJsonRpcRequest([])).toBe(false)
  })
})

describe('isJsonRpcNotification', () => {
  it('recognizes requests without an id member (§4.1)', () => {
    expect(isJsonRpcNotification({ jsonrpc: '2.0', method: 'm' })).toBe(true)
    expect(isJsonRpcNotification({ jsonrpc: '2.0', method: 'm', params: [1] })).toBe(true)
  })

  it('rejects anything with an id member or malformed payloads', () => {
    expect(isJsonRpcNotification({ jsonrpc: '2.0', id: 1, method: 'm' })).toBe(false)
    expect(isJsonRpcNotification({ jsonrpc: '2.0', id: null, method: 'm' })).toBe(false)
    expect(isJsonRpcNotification({ jsonrpc: '2.0' })).toBe(false) // missing method
    expect(isJsonRpcNotification({ jsonrpc: '1.0', method: 'm' })).toBe(false)

    expect(isJsonRpcNotification(null)).toBe(false)
    expect(isJsonRpcNotification(1)).toBe(false)
    expect(isJsonRpcNotification('x')).toBe(false)
    expect(isJsonRpcNotification([])).toBe(false)
  })
})
