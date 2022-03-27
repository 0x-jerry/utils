export type LoggerLevel = 'info' | 'warn' | 'error'

type LoggerPrefixFunction = (type: LoggerLevel) => string

export function createSimpleLogger(prefix: string | LoggerPrefixFunction) {
  const getPrefix = (type: LoggerLevel) => (typeof prefix === 'string' ? prefix : prefix(type))

  let _enable = true

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
    log(...params: unknown[]) {
      if (!_enable) return

      console.log(getPrefix('info'), ...params)
    },
    warn(...params: unknown[]) {
      if (!_enable) return

      console.warn(getPrefix('warn'), ...params)
    },
    error(...params: unknown[]) {
      if (!_enable) return

      console.error(getPrefix('error'), ...params)
    },
  }
}
