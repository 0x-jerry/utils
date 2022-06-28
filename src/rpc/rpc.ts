import { createPromiseInstance, noop, PromiseInstance } from '../core'
import { createSimpleLogger, SimpleLogger } from '../logger'
import { RPCRequest, RPCResponse, RPCMessage } from './types'

export interface RPCMethods {
  [key: string]: (...args: any[]) => any
}

export interface RPCOption {
  /**
   * Send message actively
   */
  send?: (data: RPCMessage) => void
  /**
   * Set 0 to turn off timeout check.
   * @default 10s
   */
  timeout?: number
  /**
   *
   * @default true
   */
  ignoreSelfMessage?: boolean
  verbose?: boolean

  /**
   * protocol ID
   *
   * ex. you may use random string
   */
  id: string
}

export interface RPCContext extends RPCOption {}

export interface RPCRequestCtx extends RPCRequest {
  send?: (data: RPCMessage) => void
}

const RPCTimeoutErrorSymbol = '__$rpc_timeout_error$__'

export class RPCTimeoutError extends Error {
  [RPCTimeoutErrorSymbol] = true

  static S = RPCTimeoutErrorSymbol
}

export type RPCServer<T extends RPCMethods> = {
  [key in keyof T]: (...arg: Parameters<T[key]>) => Promise<ReturnType<T[key]>>
}

export interface RPCServerProxy<T extends RPCMethods> {
  receive: (data: RPCMessage | RPCRequestCtx) => void
  proxy: RPCServer<T>
  record: Map<string, PromiseInstance>
}

export function createRPC<Server extends RPCMethods, Client extends RPCMethods = {}>(
  client: Client,
  opt: RPCOption
): RPCServerProxy<Server> {
  const options: Required<RPCOption> = Object.assign(
    {
      timeout: 10 * 1000,
      ignoreSelfMessage: true,
      verbose: false,
      send: noop,
    },
    opt
  )

  const ctx: RPCContext = {
    ...options,
  }

  const logger: SimpleLogger | null = ctx.verbose ? createSimpleLogger() : null

  const record = new Map<string, PromiseInstance>()

  const isServiceMsg = (msg: RPCMessage) => msg._ === ctx.id

  const receive = async (msg: RPCMessage) => {
    if (!isServiceMsg(msg)) {
      return
    }

    // request
    if (msg.t === 'q') {
      // this maybe send by this rpc server.
      if (ctx.ignoreSelfMessage && record.has(msg.id)) {
        // ignore this message
        return
      }

      resolveRequest(msg)
    } else {
      resolveResponse(msg)
    }
  }

  const r: RPCServerProxy<Server> = {
    proxy: getProxyObject(ctx, record) as RPCServer<Server>,
    record,
    receive,
  }

  return r

  async function resolveRequest(msg: RPCRequestCtx) {
    const response: RPCResponse = {
      _: ctx.id,
      t: 's',
      id: msg.id,
    }

    try {
      const fn = client[msg.m]
      if (!fn) throw new Error(`Not found method: [${msg.m}]`)

      response.r = await fn.call(client, ...msg.p)
    } catch (error) {
      logger?.warn('Error occurs when call method:', msg, error)
      response.e = error
    }

    const send = msg.send || ctx.send
    send?.(response)
  }

  function resolveResponse(msg: RPCResponse) {
    // response
    if (!record.has(msg.id)) {
      logger?.warn('Not found request:', msg)
      return
    }

    const p = record.get(msg.id)!
    record.delete(msg.id)

    if (msg.e) {
      p.reject(msg.e)
    } else {
      p.resolve(msg.r)
    }
  }
}

function getProxyObject(ctx: RPCContext, record: Map<string, PromiseInstance<unknown>>) {
  const getter = (_: object, method: string) => {
    return (...args: unknown[]) => {
      const request: RPCRequest = {
        t: 'q',
        _: ctx.id,
        id: uuid(),
        m: method,
        p: args,
      }

      const p = createPromiseInstance()
      record.set(request.id, p)

      if (ctx.timeout) {
        setTimeout(() => checkTimeout(request.id), ctx.timeout)
      }

      ctx.send?.(request)

      return p.instance
    }
  }

  return new Proxy(
    {},
    {
      get: getter,
    }
  )

  function checkTimeout(id: string) {
    const r = record.get(id)

    if (!r?.isPending) {
      return
    }

    r.reject(new RPCTimeoutError())
    record.delete(id)
  }
}

function uuid() {
  return Math.random().toString(16).substring(2)
}
