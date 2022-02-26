import { Arrayable, toArray } from '../core'

export type LoggerLevel = 'info' | 'warn' | 'error'

type LoggerPrefixFunction = (type: LoggerLevel) => string

export function createSimpleLogger(prefixes: Arrayable<string | LoggerPrefixFunction>) {
  const $prefixes = toArray(prefixes)

  const getPrefix = (type: LoggerLevel) =>
    $prefixes.reduce((pre, cur) => {
      const str = typeof cur === 'string' ? cur : cur(type)

      return [pre, str].filter(Boolean).join(' ')
    }, '')

  return {
    log(...params: unknown[]) {
      console.log(getPrefix('info'), ...params)
    },
    warn(...params: unknown[]) {
      console.warn(getPrefix('warn'), ...params)
    },
    error(...params: unknown[]) {
      console.error(getPrefix('error'), ...params)
    },
  }
}
