export type LoggerLevel = 'info' | 'warn' | 'error'

type LoggerPrefixFunction = (type: LoggerLevel) => string

/**
 * create a simple logger, support print prefix, and enable/disable.
 *
 * @param prefix
 * @returns
 */
export function createLogger(prefix?: string | LoggerPrefixFunction) {
  let _enable = true

  const printFactory =
    (type: LoggerLevel) =>
    (...params: unknown[]) =>
      print(type, params)

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

  function getPrefix(type: LoggerLevel) {
    if (prefix === undefined) {
      return undefined
    }

    return typeof prefix === 'string' ? prefix : prefix(type)
  }

  function print(type: LoggerLevel, params: unknown[]) {
    if (!_enable) return

    const prefix = getPrefix(type)

    if (prefix === undefined) {
      console[type](...params)
    } else {
      console[type](prefix, ...params)
    }
  }
}

export type Logger = ReturnType<typeof createLogger>
