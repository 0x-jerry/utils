import pc from 'picocolors'

export type LoggerLevel = 'info' | 'warn' | 'error'

export interface LoggerWriteOption {
  level: LoggerLevel
  namespace?: string
}

export type LoggerWriteFn = (
  opt: LoggerWriteOption,
  formatter?: string,
  ...params: unknown[]
) => void

export interface LoggerOption {
  write?: LoggerWriteFn
}

const defaultWrite: LoggerWriteFn = (opt, formatter, ...params) => {
  const { level, namespace } = opt

  const levelColor = level === 'info' ? pc.cyan : level === 'warn' ? pc.yellow : pc.red
  const levelStr = levelColor(`[${level}]`)

  const nsStr = namespace ? `[${namespace}]` : ''

  const timeStr = pc.gray(new Date().toLocaleTimeString())

  const logStr = [nsStr, timeStr, levelStr, formatter].filter(Boolean).join(' ')

  console.log(logStr, ...params)
}
/**
 * create a simple logger, support print prefix, and enable/disable.
 *
 * @param prefix
 * @returns
 */
export function createLogger(namespace?: string, opt?: LoggerOption) {
  let _enable = true

  const writeFn = opt?.write || defaultWrite

  const printFactory =
    (level: LoggerLevel) =>
    (formatter?: string, ...params: unknown[]) => {
      if (!_enable) return

      return writeFn({ level, namespace }, formatter, ...params)
    }

  const logger: ILogger = {
    log: printFactory('info'),
    info: printFactory('info'),
    warn: printFactory('warn'),
    error: printFactory('error'),
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
    ...logger,
  }
}

export type Logger = ReturnType<typeof createLogger>

export interface ILogger {
  log: (formatter?: string, ...params: unknown[]) => void
  info: (formatter?: string, ...params: unknown[]) => void
  warn: (formatter?: string, ...params: unknown[]) => void
  error: (formatter?: string, ...params: unknown[]) => void
}
