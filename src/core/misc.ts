/* c8 ignore next */
export { nanoid as uuid } from 'nanoid'

/* c8 ignore next */
export const noop = () => {}

export const hasOwn = (o: Object, name: string | symbol | number) =>
  Object.prototype.hasOwnProperty.call(o, name)

export const createAutoIncrementGenerator = (prefix = '') => {
  let i = 0
  return () => prefix + i++
}

/**
 * @deprecated use {@link createAutoIncrementGenerator} instead of.
 */
/* c8 ignore next */
export const createUUIDGenerator = createAutoIncrementGenerator
