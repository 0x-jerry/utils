import { Fn } from '../types'

export interface Procedure {
  [key: string]: Procedure | Fn
}

export type ProcedureObjectToUnion<
  Events extends Procedure,
  Prefix extends string = '',
  Key extends keyof Events = keyof Events
> = Key extends string
  ? Events[Key] extends Fn
    ? (
        name: `${Prefix}${Key}`,
        ...args: Parameters<Events[Key]>
      ) => Promise<ReturnType<Events[Key]>>
    : Events[Key] extends Procedure
    ? ProcedureObjectToUnion<Events[Key], `${Prefix extends '' ? `${Key}.` : `${Prefix}.${Key}.`}`>
    : never
  : never
