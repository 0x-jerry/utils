import { type PromiseInstance, createPromise, uuid } from '../core/index.js'
import { isFn, isObject, isString, isSymbol } from '../is/index.js'
import type { Fn } from '../types/index.js'
import {
  MessageFlag,
  type CommunicationAdapter,
  type CommunicationProtocol,
  type Procedure,
} from './types.js'

interface RPCServerOption<M> {
  methods: M
  adaptor: CommunicationAdapter
}

export function createRPCServer<M extends Procedure>(opt: RPCServerOption<M>) {
  const { adaptor, methods } = opt

  adaptor.receive(async (data) => {
    if (!isCommunicationProtocol(data)) return

    const m = getFn(methods, data.k || [])

    const resp: CommunicationProtocol = {
      _: data._,
      f: MessageFlag.Response,
    }

    try {
      const respData = await m?.(...(data.a || []))

      resp.d = respData
    } catch (error) {
      resp.e = String(error)
    } finally {
      adaptor.send(resp)
    }
  })

  return {
    methods,
  }
}

function getFn(methods: Procedure | undefined, keyPath: string[]): Fn | null {
  const [key, ...resetKeyPath] = keyPath

  if (resetKeyPath.length === 0) {
    if (isFn(methods?.[key])) {
      return methods[key]
    }
  }

  if (isObject(methods?.[key])) {
    return getFn(methods?.[key], resetKeyPath)
  }

  return null
}

type Promisify<T> = {
  [K in keyof T]: T[K] extends Fn<infer R, infer P> ? (...args: P) => Promise<R> : Promisify<T[K]>
}

interface ClientOptions {
  adaptor: CommunicationAdapter
}

export function createRPCClient<T extends Procedure>(t: ClientOptions): Promisify<T> {
  const { adaptor } = t

  const callRecord = new Map<string, PromiseInstance>()

  adaptor.receive((data) => {
    // Check response message
    if (!isResponseMessage(data)) return

    const p = callRecord.get(data._)
    if (!p) return

    callRecord.delete(data._)

    if (data.e) {
      p.reject(data.e)
    } else {
      p.resolve(data.d)
    }
  })

  return createProxy<Promisify<T>>([], send)

  async function send(keyPath: string[], ...args: unknown[]) {
    const resp: CommunicationProtocol = {
      _: uuid(),
      k: keyPath,
      a: args,
    }

    const p = createPromise()

    callRecord.set(resp._, p)

    adaptor.send(resp)

    return p.instance
  }
}

function createProxy<T>(keyPath: string[], fn: Fn) {
  const _fn = (...args: unknown[]) => fn(keyPath, ...args)

  const p = new Proxy(_fn, {
    get(_, key) {
      if (isSymbol(key)) {
        return undefined
      }

      return createProxy([...keyPath, key], fn)
    },
  })

  return p as T
}

export function defineProcedure<T extends Procedure>(t: T) {
  return t
}

function isResponseMessage(o: unknown): o is CommunicationProtocol {
  return isCommunicationProtocol(o) && !!((o.f || 0) & MessageFlag.Response)
}

function isCommunicationProtocol(o: unknown): o is CommunicationProtocol {
  return isObject(o) && '_' in o && isString(o._)
}
