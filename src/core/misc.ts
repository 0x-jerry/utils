/* c8 ignore next */
export { nanoid } from 'nanoid'

import { nanoid } from 'nanoid'
/**
 * @deprecated use {@link nanoid} instead of
 */
export const uuid = nanoid

/* c8 ignore next */
export function noop() {}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function has(o: Object, name: string | symbol | number) {
  return Object.prototype.hasOwnProperty.call(o, name)
}
