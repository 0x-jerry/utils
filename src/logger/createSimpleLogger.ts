export type LoggerLevel = 'info' | 'warn' | 'error'

type LoggerPrefixFunction = (type: LoggerLevel) => string

export function createSimpleLogger(prefix: string | LoggerPrefixFunction) {
  const getPrefix = (type: LoggerLevel) =>
    typeof prefix === 'string' ? prefix : prefix(type)

  let enable = true

  return {
    enable() {
      enable = true
    },
    disable() {
      enable = false
    },
    log(...params: unknown[]) {
      if (!enable) return

      console.log(getPrefix('info'), ...params)
    },
    warn(...params: unknown[]) {
      if (!enable) return

      console.warn(getPrefix('warn'), ...params)
    },
    error(...params: unknown[]) {
      if (!enable) return

      console.error(getPrefix('error'), ...params)
    }
  }
}
