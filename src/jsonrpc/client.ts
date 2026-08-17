import {
  type JsonRpcMethods,
  type JsonRpcNotifications,
  createJsonRpcIdGenerator,
  type JsonRpcId,
  type JsonRpcSend,
  type JsonRpcMethodParams,
  type JsonRpcMethodResult,
  type JsonRpcRequest,
  JSON_RPC_VERSION,
  type JsonRpcNotification,
  isJsonRpcResponse,
  isJsonRpcNotification,
  type NotificationHandler,
} from './core'

type Pending = {
  resolve: (result: unknown) => void
  reject: (error: Error) => void
}

/**
 * Client side of JSON-RPC 2.0: originates Requests, settles them against
 * Responses correlated by `id`, and routes Notifications to registered
 * handlers.
 */
export class JsonRpcClient<
  Methods extends JsonRpcMethods = JsonRpcMethods,
  Notifications extends JsonRpcNotifications = JsonRpcNotifications,
> {
  _id = createJsonRpcIdGenerator()
  _pending = new Map<JsonRpcId, Pending>()
  _notificationHandlers = new Map<string, NotificationHandler>()

  constructor(readonly send: JsonRpcSend) {}

  /** Send a Request and resolve with the `result` of its Response
   * (`id`-correlated). Rejects with `new Error(error.message)` when the
   * server replies with an error object. */
  call<Method extends keyof Methods & string>(
    method: Method,
    params?: JsonRpcMethodParams<Methods[Method]>,
  ): Promise<JsonRpcMethodResult<Methods[Method]>> {
    const id = this._id()

    return new Promise<JsonRpcMethodResult<Methods[Method]>>((resolve, reject) => {
      this._pending.set(id, {
        resolve: resolve as (result: unknown) => void,
        reject,
      })

      const request: JsonRpcRequest<JsonRpcMethodParams<Methods[Method]>> = {
        jsonrpc: JSON_RPC_VERSION,
        id,
        method,
      }
      if (params !== undefined) {
        request.params = params
      }

      this.send(request)
    })
  }

  /** Send a Notification — the server MUST NOT reply (§4.1). */
  notify<Method extends keyof Notifications & string>(
    method: Method,
    params?: Notifications[Method],
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

  /** Register the handler for an inbound Notification. */
  onNotification<Method extends keyof Notifications & string>(
    method: Method,
    handler: (params: Notifications[Method]) => void,
  ) {
    this._notificationHandlers.set(method, handler as NotificationHandler)
  }

  /** Drop the handler for an inbound Notification method. */
  offNotification<Method extends keyof Notifications & string>(method: Method) {
    this._notificationHandlers.delete(method)
  }

  /** Feed one inbound message (Response or Notification) into the
   * client. Responses with an unknown `id` are ignored with a warning. */
  handleMessage(message: unknown) {
    if (isJsonRpcResponse(message)) {
      const pending = this._pending.get(message.id as JsonRpcId)

      if (!pending) {
        console.warn(`[jsonrpc] response for unknown request id ${message.id}`)
        return
      }

      this._pending.delete(message.id as JsonRpcId)

      if ('error' in message) {
        const error = new Error(message.error.message)

        // Surface the error code so callers can distinguish cancellation
        // (`-32001`) and other implementation-defined codes, instead of
        // only carrying the message across the channel.
        if (typeof message.error.code === 'number') {
          ;(error as Error & { code?: unknown }).code = message.error.code
        }

        pending.reject(error)
      } else {
        pending.resolve(message.result)
      }
      return
    }

    if (isJsonRpcNotification(message)) {
      this._notificationHandlers.get(message.method)?.(message.params)
      return
    }

    console.warn('[jsonrpc] unexpected message', message)
  }

  /** Reject every in-flight call and drop notification handlers
   * (transport teardown). */
  dispose(error = new Error('JSON-RPC client disposed')) {
    for (const pending of this._pending.values()) {
      pending.reject(error)
    }
    this._pending.clear()
    this._notificationHandlers.clear()
  }
}
