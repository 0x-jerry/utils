import { RPCRequest, RPCResponse, RPCMessage } from './types'

export interface RPCMethods {
  [key: string]: (...args: any[]) => any
}

export interface RPCOption {
  send: (data: RPCMessage) => any
  receive: (resolver: (data: RPCMessage) => void) => any
}

type RPCServer<T extends RPCMethods> = {
  [key in keyof T]: (...arg: Parameters<T[key]>) => Promise<ReturnType<T[key]>>
}

export function createRPC<Server extends RPCMethods, Client extends RPCMethods = {}>(
  client: Client,
  opt: RPCOption
): RPCServer<Server> {
  const ctx: Required<RPCOption> = Object.assign(
    {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
    opt
  )

  const record = new Map<string, PPromise<any>>()

  ctx.receive(async (msg) => {
    if (msg.type === 'q') {
      // request
      const r: RPCResponse = {
        type: 's',
        id: msg.id,
      }

      try {
        r.result = await client[msg.method](...msg.params)
      } catch (error) {
        console.warn('Error occurs when call method:', msg, error)
        r.error = error
      }

      ctx.send(r)
      return
    }

    // response
    if (!record.has(msg.id)) {
      console.warn('Not found request:', msg)
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
        return (...args: any[]) => {
          const req: RPCRequest = {
            type: 'q',
            id: uuid(),
            method,
            params: args,
          }

          const p = P()
          record.set(req.id, p)

          ctx.send(req)

          return p.p
        }
      },
    }
  ) as any
}

function P<T = unknown>() {
  const p: PPromise<T> = {} as any

  p.p = new Promise((resolve, reject) => {
    p.resolve = resolve
    p.reject = reject
  })

  return p
}

type PPromise<T> = {
  p: Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

function uuid() {
  return Math.random().toString(16).substring(2)
}
