import { createPromise, type PromiseInstance, uuid } from '../core'
import { isNumber, isObject, isSymbol } from '../is'
import type { Fn } from '../types'
import type { Procedure, CommunicationAdapter, CommunicationProtocol } from './types'

interface RPCServerOption<M> {
  methods: M
  adaptor: CommunicationAdapter
}

export function createRPCServer<M extends Procedure>(opt: RPCServerOption<M>) {
  const { adaptor, methods } = opt

  adaptor.receive(async (raw) => {
    const data = adaptor.deserialize(raw)

    if (!isCommunicationProtocol(data)) return

    const m = getFn(methods, data.k || [])

    const respRaw: CommunicationProtocol = {
      _: data._,
      v: 0,
    }

    try {
      const respData = await m?.(...(data.a || []))

      respRaw.d = respData
    } catch (error) {
      respRaw.e = String(error)
    } finally {
      const resp = adaptor.serialize(respRaw)
      adaptor.send(resp)
    }
  })

  return {
    methods,
  }
}

function getFn(methods: any | undefined, keyPath: string[]): Fn | null {
  const [key, ...resetKeyPath] = keyPath

  if (resetKeyPath.length === 0) {
    return methods?.[key]
  }

  return getFn(methods?.[key], resetKeyPath)
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

  adaptor.receive((_data) => {
    const data = adaptor.deserialize(_data)

    if (!isCommunicationProtocol(data)) return

    const p = callRecord.get(data._)
    if (!p) return

    callRecord.delete(data._)

    if (data.e) {
      p.reject(data.e)
    } else {
      p.resolve(data.d)
    }
  })

  return createProxy([], send)

  async function send(keyPath: string[], ...args: any[]) {
    const raw: CommunicationProtocol = {
      _: uuid(),
      v: 0,
      k: keyPath,
      a: args,
    }

    const p = createPromise()

    callRecord.set(raw._, p)

    const data = adaptor.serialize(raw)

    adaptor.send(data)

    return p.instance
  }
}

function createProxy(keyPath: string[], fn: Fn): any {
  const _fn = (...args: any[]) => fn(keyPath, ...args)

  const p = new Proxy(_fn, {
    get(_, key) {
      if (isSymbol(key)) {
        return undefined
      }

      return createProxy([...keyPath, key], fn)
    },
  })

  return p
}

export function defineProcedure<T extends Procedure>(t: T) {
  return t
}

function isCommunicationProtocol(o: unknown): o is CommunicationProtocol {
  return isObject(o) && '_' in o && 'v' in o && isNumber(o.v)
}
