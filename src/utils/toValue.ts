import { isFn } from '../is'
import type { Factory } from '../types'

export function toValue<T>(valueOrFn: Factory<T>): T {
  return isFn(valueOrFn) ? valueOrFn() : valueOrFn
}
