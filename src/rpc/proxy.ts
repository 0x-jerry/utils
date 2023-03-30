import { is } from '../is'

const fn = (keyPath: string[], ...args: any[]) => {
  console.log('call', keyPath, ...args)
}

export function createProxy(keyPath: string[]): any {
  const _fn = (...args: any[]) => fn(keyPath, ...args)

  const p = new Proxy(_fn, {
    get(_, key) {
      if (is.symbol(key)) {
        return undefined
      }

      return createProxy([...keyPath, key])
    },
  })

  return p
}
