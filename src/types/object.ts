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
