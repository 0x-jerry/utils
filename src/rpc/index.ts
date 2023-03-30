import { UnionToIntersection } from 'type-fest'
import { Procedure, ProcedureObjectToUnion } from './types'

function createServer<T extends Procedure>(t: T) {
  return {} as {
    t: T
  }
}

function createClient<T extends Procedure>(t?: any) {
  return {} as {
    call: UnionToIntersection<ProcedureObjectToUnion<T>>
  }
}

function defineProcedure<T extends Procedure>(t: T) {
  return t
}

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

const server = createServer(methods)

type RPCMethods = typeof server['t']

// "frontend"

const client = createClient<RPCMethods>()

// something like this ?
const res = await client.call('xxx')
