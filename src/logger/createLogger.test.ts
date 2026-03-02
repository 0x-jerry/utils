import { createLogger, type LoggerWriteFn } from './createLogger'

describe('createSimpleLogger', () => {
  it('output', () => {
    const { console, write } = mockConsole()

    const logger = createLogger('tt', { write })

    logger.log('hello')
    expect(console.info).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.warn('hello')
    expect(console.warn).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.error('hello')
    expect(console.error).toHaveBeenLastCalledWith('[tt]', 'hello')
  })

  it('enable/disable', () => {
    const { console, write } = mockConsole()

    const logger = createLogger('tt', { write })

    logger.log('hello')
    expect(console.info).toHaveBeenLastCalledWith('[tt]', 'hello')
    expect(logger.isEnabled).toBe(true)

    logger.disable()
    expect(logger.isEnabled).toBe(false)
    logger.log('hello1')
    expect(console.info).toHaveBeenLastCalledWith('[tt]', 'hello')

    logger.enable()
    logger.log('hello2')
    expect(console.info).toHaveBeenLastCalledWith('[tt]', 'hello2')
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

  const write: LoggerWriteFn = (opt, formatter, ...params) => {
    if (opt.namespace) {
      console[opt.level](`[${opt.namespace}]`, formatter, ...params)
    } else {
      console[opt.level](formatter, ...params)
    }
  }

  return {
    write,
    console,
  }
}
