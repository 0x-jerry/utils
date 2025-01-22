import type { Optional } from './utils'

/**
 *
 * @example
 *
 * ```ts
 * interface Target {
 *  a: string
 *  b: number
 *  c: boolean
 *  d: string[]
 * }
 *
 * type a = ExtractObjectKeys<Target, number | string> // => 'a' | 'b'
 * type b = ExtractObjectKeys<Target, Iterable<any>> // => 'a' | 'd'
 * type c = ExtractObjectKeys<Target, Iterable<any>, string> // => 'd'
 * ```
 */
export type ExtractObjectKeys<T extends {}, TrueCondition, FalseCondition = never> = {
  [key in keyof T]: T[key] extends FalseCondition
    ? never
    : T[key] extends TrueCondition
      ? key
      : never
}[keyof T]

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type EmptyObject = {}

export type PlainObject<T = string> = Record<string, T>

export type ObjectValues<E extends Record<string, string | number | boolean | null | undefined>> =
  E[keyof E]

export type DeepPartial<T> = T extends Record<string | number, unknown>
  ? {
      [Key in keyof T]?: DeepPartial<T[Key]>
    }
  : Optional<T>

export type DeepRequired<T> = T extends Record<string | number, unknown>
  ? {
      [Key in keyof T]: DeepRequired<T[Key]>
    }
  : NonNullable<T>
