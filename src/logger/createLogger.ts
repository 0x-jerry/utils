export type LoggerLevel = 'info' | 'warn' | 'error'

type LoggerPrefixFunction = (type: LoggerLevel) => string

export interface LoggerOption {
  write?: (type: LoggerLevel, ...params: unknown[]) => void
}

/**
 * create a simple logger, support print prefix, and enable/disable.
 *
 * @param prefix
 * @returns
 */
export function createLogger(prefix?: string | LoggerPrefixFunction, opt?: LoggerOption) {
  let _enable = true

  const printFactory =
    (type: LoggerLevel) =>
    (...params: unknown[]) => {
      if (!_enable) return

      const printFn = opt?.write || console[type]

      const prefix = getPrefix(type)
      if (prefix) {
        return printFn(type, prefix, ...params)
      }

      return printFn(type, ...params)
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

  function getPrefix(type: LoggerLevel) {
    if (prefix === undefined) {
      return undefined
    }

    return typeof prefix === 'string' ? prefix : prefix(type)
  }
}

export type Logger = ReturnType<typeof createLogger>
