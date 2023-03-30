import { Fn } from '../types'
import { createWorkerAdaptor } from './adaptor/worker'
import { createProxy } from './proxy'
import { Procedure, CommunicationAdapter } from './types'

interface ServerOption<M> {
  methods: M
  adaptor: CommunicationAdapter
}

function createServer<M extends Procedure>(opt: ServerOption<M>) {
  return {
    methods: opt.methods,
  }
}

type Promisify<T> = {
  [K in keyof T]: T[K] extends Fn<infer R, infer P> ? (...args: P) => Promise<R> : Promisify<T>
}

interface ClientOptions {
  adaptor: CommunicationAdapter
}

function createClient<T extends Procedure>(t: ClientOptions): Promisify<T> {
  const { adaptor } = t

  adaptor.receive((_data) => {
    const data = adaptor.deserialize(_data)
  })

  return createProxy([])
}

function defineProcedure<T extends Procedure>(t: T) {
  return t
}

//  --------- test

// "backend"

const methods = defineProcedure({
  xxx() {
    return {
      1: 2,
    }
  },
  ccc: defineProcedure({
    xxx() {
      return {
        3: 3,
      }
    },
  }),
})

const server = createServer({
  methods,
  adaptor: createWorkerAdaptor(),
})

type RPCMethods = typeof server['methods']

// "frontend"

const client = createClient<RPCMethods>({
  adaptor: createWorkerAdaptor(new Worker('')),
})

// something like this ?
const res = await client.ccc.xxx()
