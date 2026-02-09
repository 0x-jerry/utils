import { createPromise, nanoid } from '../core'
import { isFn, isObject, isSymbol } from '../is'
import type { Fn } from '../types'
import {
  type CommunicationAdapter,
  type CommunicationProtocol,
  MessageFlag,
  type Procedure,
} from './types'
import { isRequestMessage, isResponseMessage } from './utils'

export interface RPCServerOption<M> {
  methods: M
  namespace?: string
  adaptor: CommunicationAdapter
}

export function createRPCServer<M extends Procedure>(opt: RPCServerOption<M>) {
  const { adaptor, methods, namespace } = opt

  adaptor.registerReceiveCallback((data) => {
    if (!isRequestMessage(data, namespace)) return false

    const m = getFn(methods, data.k || [])

    const resp: CommunicationProtocol = {
      _: data._,
      f: MessageFlag.Response,
    }

    processMessage()

    return true

    async function processMessage() {
      try {
        const respData = await m?.(...(data.a || []))

        resp.d = respData
      } catch (error) {
        resp.e = String(error)
      } finally {
        adaptor.send(resp)
      }
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

export interface ClientOptions {
  namespace?: string
  adaptor: CommunicationAdapter
}

export function createRPCClient<T extends Procedure>(t: ClientOptions): Promisify<T> {
  const { adaptor, namespace } = t

  const callRecord = new Map<string, PromiseWithResolvers<unknown>>()

  adaptor.registerReceiveCallback((data) => {
    // Check response message
    if (!isResponseMessage(data, namespace)) return false

    const p = callRecord.get(data._)
    if (!p) return false

    callRecord.delete(data._)

    if (data.e) {
      p.reject(data.e)
    } else {
      p.resolve(data.d)
    }

    return true
  })

  return createProxy<Promisify<T>>([], send)

  async function send(keyPath: string[], ...args: unknown[]) {
    const resp: CommunicationProtocol = {
      _: nanoid(),
      f: MessageFlag.Default,
      k: keyPath,
      a: args,
    }

    const p = createPromise()

    callRecord.set(resp._, p)

    adaptor.send(resp)

    return p.promise
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
