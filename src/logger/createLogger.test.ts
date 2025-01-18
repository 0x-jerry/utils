import { type LoggerLevel, type LoggerOption, createLogger } from './createLogger'

describe('createSimpleLogger', () => {
  it('output', () => {
    const { console, write } = mockConsole()

    const logger = createLogger('[tt]', { write })

    logger.log('hello')
    expect(console.info).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.warn('hello')
    expect(console.warn).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.error('hello')
    expect(console.error).toHaveBeenLastCalledWith('[tt]', 'hello')
  })

  it('function prefix', () => {
    let level: LoggerLevel | undefined

    const { console, write } = mockConsole()

    let idx = 0

    const logger = createLogger(
      (t) => {
        level = t
        return `[${idx++}]`
      },
      { write },
    )

    logger.log('hello')
    expect(console.info).toBeCalledTimes(1)
    expect(console.info.mock.calls[0][0]).toBe('[0]')
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

    const { console, write } = mockConsole()

    const logger = createLogger(
      (t) => {
        level = t
        return `[${idx++}]`
      },
      { write },
    )

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
    const { console, write } = mockConsole()

    const logger = createLogger(undefined, { write })

    logger.log('hello')
    expect(console.info).toHaveBeenLastCalledWith('hello')

    logger.warn('hello')
    expect(console.warn).toHaveBeenLastCalledWith('hello')

    logger.error('hello')
    expect(console.error).toHaveBeenLastCalledWith('hello')
  })
})

function mockConsole() {
  const console = {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }

  const write: LoggerOption['write'] = (type, ...params) => {
    console[type](...params)
  }

  return {
    write,
    console,
  }
}
