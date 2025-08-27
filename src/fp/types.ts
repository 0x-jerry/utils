import type { Fn } from '../types'

export type IComposeResult<T extends Fn> = T & {
  exec(...params: Parameters<T>): ReturnType<T>
}
