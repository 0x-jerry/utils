import { isFn } from '../is/index.js'

export type Value<T> = T | (() => T)

export function toValue<T>(valueOrFn: Value<T>): T {
  return isFn(valueOrFn) ? valueOrFn() : valueOrFn
}
