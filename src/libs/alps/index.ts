import { createAlpsInstance } from './core'

export * from './types'

type CreateAlpsInstance = typeof createAlpsInstance

export type Alps = ReturnType<CreateAlpsInstance> & {
  create: CreateAlpsInstance
}

export const alps = createAlpsInstance() as Alps

alps.create = createAlpsInstance
