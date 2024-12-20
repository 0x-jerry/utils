import { isFn } from '../is'

export type Value<T> = T | (() => T)

export function toValue<T>(valueOrFn: Value<T>): T {
  return isFn(valueOrFn) ? valueOrFn() : valueOrFn
}
