/* c8 ignore next */
export { nanoid as uuid } from 'nanoid'

/* c8 ignore next */
export const noop = () => {}

export const has = (o: Object, name: string | symbol | number) =>
  Object.prototype.hasOwnProperty.call(o, name)
