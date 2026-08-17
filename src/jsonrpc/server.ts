import { isObject } from '../is'
import {
  type JsonRpcMethods,
  type JsonRpcNotifications,
  type RequestHandler,
  type NotificationHandler,
  type JsonRpcSend,
  type JsonRpcMethodParams,
  type JsonRpcMethodResult,
  type JsonRpcNotification,
  JSON_RPC_VERSION,
  JsonRpcErrorCode,
  type JsonRpcSuccessResponse,
  type JsonRpcId,
  jsonRpcErrorMessage,
  type JsonRpcErrorResponse,
  hasOwn,
  isRequestId,
} from './core'

/**
 * Server side of JSON-RPC 2.0: dispatches Requests to registered method
 * handlers and replies with `result`/`error` Responses (echoing the
 * request `id`), and dispatches Notifications without replying (§4.1).
 *
 * Handlers may be async. A thrown error replies `-32000` (Server error,
 * §5.1) with the error's message. Unknown methods reply `-32601`.
 * Structurally invalid messages and top-level Arrays (batch, §6 — not
 * supported) reply `-32600` with `id: null` per §5.
 */
export class JsonRpcServer<
  Methods extends JsonRpcMethods = JsonRpcMethods,
  Notifications extends JsonRpcNotifications = JsonRpcNotifications,
> {
  _requestHandlers = new Map<string, RequestHandler>()
  _notificationHandlers = new Map<string, NotificationHandler>()

  constructor(readonly send: JsonRpcSend) {}

  /** Register the handler backing a Request method. */
  onRequest<Method extends keyof Methods & string>(
    method: Method,
    handler: (
      params: JsonRpcMethodParams<Methods[Method]>,
    ) => JsonRpcMethodResult<Methods[Method]> | Promise<JsonRpcMethodResult<Methods[Method]>>,
  ) {
    this._requestHandlers.set(method, handler as RequestHandler)
  }

  /** Register the handler backing an inbound Notification method. */
  onNotification<Method extends keyof Notifications & string>(
    method: Method,
    handler: (params: Notifications[Method]) => void,
  ) {
    this._notificationHandlers.set(method, handler as NotificationHandler)
  }

  /** Push a Notification to the client — the client MUST NOT reply
   * (§4.1). Typed by the notification map of the pairing client. */
  notify<Method extends keyof Notifications & string>(
    method: Method,
    params: Notifications[Method],
  ) {
    const notification: JsonRpcNotification<Notifications[Method]> = {
      jsonrpc: JSON_RPC_VERSION,
      method,
    }
    if (params !== undefined) {
      notification.params = params
    }

    this.send(notification)
  }

  /** Feed one inbound message (Request or Notification) into the
   * server and send the appropriate Reply (never for Notifications). */
  handleMessage(message: unknown) {
    // Batch (§6) is out of scope: reject as a single Invalid Request.
    if (Array.isArray(message)) {
      this._replyError(null, JsonRpcErrorCode.InvalidRequest)
      return
    }

    if (
      !isObject(message) ||
      message.jsonrpc !== JSON_RPC_VERSION ||
      typeof message.method !== 'string'
    ) {
      this._replyError(null, JsonRpcErrorCode.InvalidRequest)
      return
    }

    const method = message.method
    const params = hasOwn(message, 'params') ? message.params : undefined

    if (hasOwn(message, 'id')) {
      if (!isRequestId(message.id) || message.id === null) {
        // id present but not a String/Number (or NULL, whose use the spec
        // discourages and which we never generate): Invalid Request.
        this._replyError(null, JsonRpcErrorCode.InvalidRequest)
        return
      }

      const id = message.id
      const handler = this._requestHandlers.get(method)

      if (!handler) {
        this._replyError(id, JsonRpcErrorCode.MethodNotFound)
        return
      }

      Promise.resolve()
        .then(() => handler(params))
        .then(
          (result) => {
            const response: JsonRpcSuccessResponse = {
              jsonrpc: JSON_RPC_VERSION,
              id,
              result,
            }
            this.send(response)
          },
          (error) => {
            // Honor an implementation-defined code carried on the error
            // (e.g. a `CancelledError`), falling back to `-32000`. Only
            // codes in the spec's reserved server-error range are honored
            // so unrelated numeric `code` properties (DOMException,
            // library errors, ...) can't leak onto the wire.
            const code = (error as Error & { code?: unknown })?.code
            const isServerErrorCode =
              typeof code === 'number' &&
              code <= JsonRpcErrorCode.ServerError &&
              code >= JsonRpcErrorCode.ServerError - 99
            this._replyError(id, isServerErrorCode ? code : JsonRpcErrorCode.ServerError, error)
          },
        )
      return
    }

    // Notification — MUST NOT reply (§4.1). Errors are unobservable by
    // the client, so they are only logged.
    const handler = this._notificationHandlers.get(method)

    if (!handler) {
      return
    }

    try {
      handler(params)
    } catch (error) {
      console.error('[jsonrpc] notification handler failed', error)
    }
  }

  _replyError(id: JsonRpcId | null, code: number, cause?: unknown) {
    const message = cause instanceof Error ? cause.message : jsonRpcErrorMessage(code)

    const response: JsonRpcErrorResponse = {
      jsonrpc: JSON_RPC_VERSION,
      id,
      error: { code, message },
    }
    this.send(response)
  }
}
