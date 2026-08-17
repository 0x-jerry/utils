/**
 * Minimal JSON-RPC 2.0 layer, per
 * https://www.jsonrpc.org/specification
 *
 * Implements the request / response / notification / error-object rules
 * (§4, §5, §5.1) of the spec. Deliberately out of scope: batch requests
 * (§6 — a top-level Array is rejected as Invalid Request), the spec's own
 * `rpc.*` request cancellation, and textual JSON parsing (payloads always
 * arrive as already-parsed objects, so `-32700` Parse error can only ever
 * occur on a future textual transport).
 */

import { isObject } from '../is'

/** Request id. The spec (§4) allows String, Number or NULL; NULL is
 * discouraged and we never generate it. */
export type JsonRpcId = string | number

/** A rpc call (§4). `params` MAY be omitted; when present it must be an
 * Array (by-position) or Object (by-name). */
export interface JsonRpcRequest<Params = unknown> {
  jsonrpc: '2.0'
  id: JsonRpcId
  method: string
  params?: Params
}

/** A Request without an `id` member (§4.1). The server MUST NOT reply. */
export interface JsonRpcNotification<Params = unknown> {
  jsonrpc: '2.0'
  method: string
  params?: Params
}

/** Error object (§5.1): integer `code`, single-sentence String `message`,
 * optional `data`. */
export interface JsonRpcError<Data = unknown> {
  code: number
  message: string
  data?: Data
}

/** Success response (§5): `result` present, `error` MUST NOT exist. */
export interface JsonRpcSuccessResponse<Result = unknown> {
  jsonrpc: '2.0'
  id: JsonRpcId
  result: Result
}

/** Error response (§5): `error` present, `result` MUST NOT exist. `id`
 * MUST be Null when the id of the request could not be detected. */
export interface JsonRpcErrorResponse<Data = unknown> {
  jsonrpc: '2.0'
  id: JsonRpcId | null
  error: JsonRpcError<Data>
}

export type JsonRpcResponse<Result = unknown, Data = unknown> =
  | JsonRpcSuccessResponse<Result>
  | JsonRpcErrorResponse<Data>

/** Anything that can travel over the channel. */
export type JsonRpcMessage<Result = unknown, Data = unknown> =
  | JsonRpcRequest
  | JsonRpcNotification
  | JsonRpcResponse<Result, Data>

/** Contract of a JSON-RPC method: its `params` and `result`. `params`
 * is `undefined` for param-less methods and is omitted on the wire. */
export interface JsonRpcMethodContract<Params = unknown, Result = unknown> {
  params: Params
  result: Result
}

/** Method name → contract map. Drives typing of a client/server pair. */
export type JsonRpcMethods = Record<string, JsonRpcMethodContract>

/** Notification name → params map. */
export type JsonRpcNotifications = Record<string, unknown>

/** Params of a method contract. */
export type JsonRpcMethodParams<Contract extends JsonRpcMethodContract> = Contract['params']

/** Result of a method contract. */
export type JsonRpcMethodResult<Contract extends JsonRpcMethodContract> = Contract['result']

/** Pre-defined error codes (§5.1). The `-32000..-32099` range is
 * reserved for implementation-defined server errors. */
export const JsonRpcErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  ServerError: -32000,
  /** A run stopped by an app-level cancel request (golden-graph protocol). */
  Cancelled: -32001,
} as const

/**
 * Thrown by an executor backend when the in-flight run was cancelled via
 * the golden-graph cancel protocol. Over the wire the run's `execute`
 * Response settles with `error: { code: -32001, message: 'cancelled' }`;
 * {@link JsonRpcClient} re-attaches the code to the rejected `Error` so
 * callers can recognize a user-initiated stop with {@link isCancelledError}.
 */
export class CancelledError extends Error {
  code = JsonRpcErrorCode.Cancelled

  constructor(message = 'cancelled') {
    super(message)
    this.name = 'CancelledError'
  }
}

/** Whether an error is a user-initiated cancellation (`-32001`). */
export function isCancelledError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error as Error & { code?: unknown }).code === JsonRpcErrorCode.Cancelled
  )
}

export const JSON_RPC_VERSION = '2.0' as const

/** Standard single-sentence message for a pre-defined code (§5.1). */
export function jsonRpcErrorMessage(code: number): string {
  switch (code) {
    case JsonRpcErrorCode.ParseError:
      return 'Parse error'
    case JsonRpcErrorCode.InvalidRequest:
      return 'Invalid Request'
    case JsonRpcErrorCode.MethodNotFound:
      return 'Method not found'
    case JsonRpcErrorCode.InvalidParams:
      return 'Invalid params'
    case JsonRpcErrorCode.InternalError:
      return 'Internal error'
    default:
      return `Server error (${code})`
  }
}

export function createJsonRpcIdGenerator() {
  let id = 0
  // Integer ids only — the spec discourages Null and fractional Numbers.
  return () => ++id
}

export function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

export function isRequestId(value: unknown): value is JsonRpcId | null {
  return typeof value === 'string' || typeof value === 'number' || value === null
}

/** A Response: `jsonrpc: '2.0'` + an `id` member + exactly one of
 * `result`/`error`. Discriminate responses from requests by the `id`
 * member (§5), not by `result`/`error` presence. */
export function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  if (!isObject(value) || value.jsonrpc !== JSON_RPC_VERSION) return false
  if (!hasOwn(value, 'id') || !isRequestId(value.id)) return false
  const hasResult = hasOwn(value, 'result')
  const hasError = hasOwn(value, 'error') && isObject(value.error)
  return hasResult !== hasError
}

/** A Request (§4): `jsonrpc: '2.0'` + String `method` + an `id` member. */
export function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  if (!isObject(value) || value.jsonrpc !== JSON_RPC_VERSION) return false
  if (typeof value.method !== 'string') return false
  return hasOwn(value, 'id') && isRequestId(value.id) && value.id !== null
}

/** A Notification (§4.1): a Request without an `id` member. */
export function isJsonRpcNotification(value: unknown): value is JsonRpcNotification {
  if (!isObject(value) || value.jsonrpc !== JSON_RPC_VERSION) return false
  if (typeof value.method !== 'string') return false
  return !hasOwn(value, 'id')
}

/** What a transport endpoint can send out. */
export type JsonRpcOutbound<Result = unknown, Data = unknown> =
  | JsonRpcRequest
  | JsonRpcNotification
  | JsonRpcResponse<Result, Data>

export type JsonRpcSend = (message: JsonRpcOutbound) => void

export type RequestHandler = (params: unknown) => unknown | Promise<unknown>
export type NotificationHandler = (params: unknown) => void
