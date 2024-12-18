/* c8 ignore next */
export { nanoid } from 'nanoid'

/* c8 ignore next */
export function noop() {}

export function has<T extends {}>(o: T, name: string | symbol | number) {
  return Object.prototype.hasOwnProperty.call(o, name)
}
