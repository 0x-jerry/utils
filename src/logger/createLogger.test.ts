import { type LoggerLevel, createLogger } from './createLogger'

describe('createSimpleLogger', () => {
  it('output', () => {
    const console = mockConsole()

    const logger = createLogger('[tt]')

    logger.log('hello')
    expect(console.log).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.warn('hello')
    expect(console.warn).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.error('hello')
    expect(console.error).toHaveBeenLastCalledWith('[tt]', 'hello')
  })

  it('function prefix', () => {
    let level: LoggerLevel | undefined

    const console = mockConsole()

    let idx = 0

    const logger = createLogger((t) => {
      level = t
      return `[${idx++}]`
    })

    logger.log('hello')
    expect(console.log).toBeCalledTimes(1)
    expect(console.log.mock.calls[0][0]).toBe('[0]')
    expect(level).toBe('info')

    logger.warn('hello')
    expect(console.warn.mock.calls[0][0]).toBe('[1]')
    expect(level).toBe('warn')

    logger.error('hello')
    expect(console.error.mock.calls[0][0]).toBe('[2]')
    expect(level).toBe('error')
  })

  it('enable/disable', () => {
    let level: LoggerLevel | undefined

    let idx = 0

    const logger = createLogger((t) => {
      level = t
      return `[${idx++}]`
    })

    logger.log('hello')
    expect(level).toBe('info')
    level = undefined
    expect(logger.isEnabled).toBe(true)

    logger.disable()
    expect(logger.isEnabled).toBe(false)
    logger.warn('hello')
    logger.log('hello')
    logger.warn('hello')
    expect(level).toBe(undefined)

    logger.enable()
    logger.error('hello')
    expect(level).toBe('error')
  })

  it('should print without prefix', () => {
    const console = mockConsole()

    const logger = createLogger()

    logger.log('hello')
    expect(console.log).toHaveBeenLastCalledWith('hello')

    logger.warn('hello')
    expect(console.warn).toHaveBeenLastCalledWith('hello')

    logger.error('hello')
    expect(console.error).toHaveBeenLastCalledWith('hello')
  })
})

function mockConsole() {
  const warn = vi.spyOn(console, 'warn')
  const log = vi.spyOn(console, 'info')
  const error = vi.spyOn(console, 'error')

  return {
    log,
    warn,
    error,
  }
}
