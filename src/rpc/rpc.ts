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
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      timeout: 10 * 1000,
      ignoreSelfMessage: true,
      verbose: false,
    },
    opt
  )

  const logger: SimpleLogger | null = ctx.verbose ? createSimpleLogger() : null

  const record = new Map<string, PromiseInstance>()

  ctx.receive(async (msg) => {
    if (msg.type === 'q') {
      // this maybe send by this rpc server self.
      if (ctx.ignoreSelfMessage && record.has(msg.id)) {
        // ignore this message
        return
      }

      // request
      const r: RPCResponse = {
        type: 's',
        id: msg.id,
      }

      try {
        const fn = client[msg.method]
        if (!fn) throw new Error(`Not found method: [${msg.method}]`)

        r.result = await fn.call(client, ...msg.params)
      } catch (error) {
        logger?.warn('Error occurs when call method:', msg, error)
        r.error = error
      }

      ctx.send(r)
      return
    }

    // response
    if (!record.has(msg.id)) {
      logger?.warn('Not found request:', msg)
      return
    }

    const p = record.get(msg.id)!
    record.delete(msg.id)

    if (msg.error) {
      p.reject(msg.error)
    } else {
      p.resolve(msg.result)
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
          const req: RPCRequest = {
            type: 'q',
            id: uuid(),
            method,
            params: args,
          }

          const p = createPromiseInstance()
          record.set(req.id, p)

          if (ctx.timeout) {
            setTimeout(() => checkTimeout(req.id), ctx.timeout)
          }

          ctx.send(req)

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
