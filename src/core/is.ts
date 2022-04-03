import { Ctor } from './types'

/**
 * Please attention, this is only working with ES6.
 *
 * It will not working if you compile code to ES5.
 *
 * @param o
 * @returns
 */
export function isClass<Ins, Params>(o: unknown): o is Ctor<Ins, Params> {
  return /^\s*class/.test(String(o))
}
