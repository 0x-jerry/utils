export type LoggerLevel = 'info' | 'warn' | 'error'

type LoggerPrefixFunction = (type: LoggerLevel) => string

export function createSimpleLogger(prefix?: string | LoggerPrefixFunction) {
  const getPrefix = (type: LoggerLevel) => {
    if (prefix === undefined) {
      return undefined
    }

    return typeof prefix === 'string' ? prefix : prefix(type)
  }

  let _enable = true

  const printFactory =
    (type: LoggerLevel) =>
    (...params: unknown[]) => {
      if (!_enable) return

      const prefix = getPrefix(type)

      if (prefix === undefined) {
        console[type](...params)
      } else {
        console[type](prefix, ...params)
      }
    }

  return {
    get isEnabled() {
      return _enable
    },
    enable() {
      _enable = true
    },
    disable() {
      _enable = false
    },
    log: printFactory('info'),
    warn: printFactory('warn'),
    error: printFactory('error'),
  }
}

export type SimpleLogger = ReturnType<typeof createSimpleLogger>
