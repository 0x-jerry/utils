/* c8 ignore next */
export { nanoid as uuid } from 'nanoid'

/* c8 ignore next */
export function noop() {}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function has(o: Object, name: string | symbol | number) {
  return Object.prototype.hasOwnProperty.call(o, name)
}
