/**
 * Function
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Fn<Return = unknown, Parameters extends unknown[] = any[]> = (
  ...params: Parameters
) => Return

/**
 * Array, or not.
 */
export type Arrayable<T> = T | T[]

/**
 * Promise, or not.
 */
export type Awaitable<T> = T | PromiseLike<T>

/**
 * Infers the element type of an array.
 */
export type ElementOf<T> = T extends Array<infer E> ? E : never

export interface Ctor<Instance = unknown, Params extends unknown[] = unknown[]> {
  new (...args: Params): Instance
}

export type Optional<T> = T | undefined | null

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

export type JsonPrimitive = string | number | boolean | null | undefined
export type JsonObject = { [key: string | number]: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type PrimitiveType = JsonPrimitive | bigint | symbol

export type MakeEnum<Enum extends Record<string, string | number | boolean | null | undefined>> =
  Enum[keyof Enum]
