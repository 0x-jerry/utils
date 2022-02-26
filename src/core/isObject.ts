export function isObject(o: any): o is Object {
  return o !== null && typeof o === 'object'
}
