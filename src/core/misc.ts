/* c8 ignore next */
export { nanoid as uuid } from 'nanoid'

/* c8 ignore next */
export const noop = () => {}

export const has = (o: Object, name: string | symbol | number) =>
  Object.prototype.hasOwnProperty.call(o, name)

/**
 * @deprecated use {@link has} instead of.
 */
/* c8 ignore next */
export const hasOwn = has

/**
 * create a auto increment generator
 *
 * @deprecated use [_.uniqueId](https://lodash.com/docs/4.17.15#uniqueId) instead of.
 * @param prefix
 * @returns
 */
export const createAutoIncrementGenerator = (prefix = '') => {
  let i = 0
  return () => prefix + i++
}

/**
 * create a auto increment generator
 *
 * @deprecated use [_.uniqueId](https://lodash.com/docs/4.17.15#uniqueId) instead of.
 */
/* c8 ignore next */
export const createUUIDGenerator = createAutoIncrementGenerator
