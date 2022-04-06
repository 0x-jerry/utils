/* c8 ignore next */
export const noop = () => {}

export const hasOwn = (o: Object, name: string) => Object.prototype.hasOwnProperty.call(o, name)
