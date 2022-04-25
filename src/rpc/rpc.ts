import { createPromiseInstance, PromiseInstance } from '../core'
import { createSimpleLogger, SimpleLogger } from '../logger'
import { RPCRequest, RPCResponse, RPCMessage } from './types'

export interface RPCMethods {
  [key: string]: (...args: any[]) => any
}

export interface RPCOption {
  send: (data: RPCMessage) => any
  receive: (resolver: (data: RPCMessage) => void) => any
  /**
   * set 0 to turn off timeout check.
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

const RPCTimeoutErrorSymbol = '__$rpc_timeout_error$__'
export const RPCStatusSymbol = '__$rpc_status$__'

export class RPCTimeoutError extends Error {
  [RPCTimeoutErrorSymbol] = true

  static S = RPCTimeoutErrorSymbol
}

export type RPCServer<T extends RPCMethods> = {
  [key in keyof T]: (...arg: Parameters<T[key]>) => Promise<ReturnType<T[key]>>
} & {
  [RPCStatusSymbol]: Map<string, PromiseInstance>
}

export function createRPC<Server extends RPCMethods, Client extends RPCMethods = {}>(
  client: Client,
  opt: RPCOption
): RPCServer<Server> {
  const ctx: Required<RPCOption> = Object.assign(
    {
      timeout: 10 * 1000,
      ignoreSelfMessage: true,
      verbose: false,
    },
    opt
  )

  const logger: SimpleLogger | null = ctx.verbose ? createSimpleLogger() : null

  const record = new Map<string, PromiseInstance>()

  const isServiceMsg = (msg: RPCMessage) => msg._ === ctx.id

  ctx.receive(async (msg) => {
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

      ctx.send(response)
      return
    }

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
  })

  return new Proxy(
    {},
    {
      get(_, method: string) {
        if (method === RPCStatusSymbol) {
          return record
        }

        return (...args: any[]) => {
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

          ctx.send(request)

          return p.instance
        }
      },
    }
  ) as any

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
