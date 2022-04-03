import { Ctor } from './types'

export function isClass<Ins, Params>(o: unknown): o is Ctor<Ins, Params> {
  return /^\s*class/.test(String(o))
}
