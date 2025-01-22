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

export interface Ctor<Instance = unknown, Params extends unknown[] = unknown[]> {
  new (...args: Params): Instance
}

export type Optional<T> = T | undefined | null

export type JsonPrimitive = string | number | boolean | null | undefined
export type JsonObject = { [key: string | number]: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type PrimitiveType = JsonPrimitive | bigint | symbol
