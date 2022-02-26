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
