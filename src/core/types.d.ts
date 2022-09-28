/**
 * Function
 */
export type Fn<Return = any, Parameters extends any[] = any[]> = (...params: Parameters) => Return

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

export interface Ctor<Instance = any, Params = any[]> {
  new (...args: Params): Instance
}

export type Optional<T> = T | undefined

export type DeepPartial<T> = T extends {}
  ? {
      [Key in keyof T]?: DeepPartial<T[Key]>
    }
  : Optional<T>

export type DeepRequired<T> = T extends {}
  ? {
      [Key in keyof T]: DeepRequired<T[Key]>
    }
  : NonNullable<T>

export type JsonPrimitive = string | number | boolean | null | undefined
export type JsonObject = { [key: string | number]: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type PrimitiveType = JsonPrimitive | bigint | symbol
