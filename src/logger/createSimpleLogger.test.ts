import { createSimpleLogger } from './createSimpleLogger'

describe('createSimpleLogger', () => {
  it('output', () => {
    let prefix, other

    const clear = () => {
      prefix = undefined
      other = undefined
    }

    console.warn =
      console.error =
      console.log =
        ($prefix, ...$other) => {
          prefix = $prefix
          other = $other
        }

    const logger = createSimpleLogger('[tt]')

    logger.log('hello')
    expect(prefix).toBe('[tt]')
    expect(other).toEqual(['hello'])
    clear()

    logger.warn('hello')
    expect(prefix).toBe('[tt]')
    expect(other).toEqual(['hello'])
    clear()

    logger.error('hello')
    expect(prefix).toBe('[tt]')
    expect(other).toEqual(['hello'])
    clear()
  })

  it('function prefix', () => {
    let prefix, level

    const clear = () => {
      prefix = undefined
      level = undefined
    }

    console.warn =
      console.error =
      console.log =
        ($prefix) => {
          prefix = $prefix
        }

    let idx = 0

    const logger = createSimpleLogger((t) => {
      level = t
      return `[${idx++}]`
    })

    logger.log('hello')
    expect(prefix).toBe('[0]')
    expect(level).toBe('info')
    clear()

    logger.warn('hello')
    expect(prefix).toBe('[1]')
    expect(level).toBe('warn')
    clear()

    logger.error('hello')
    expect(prefix).toBe('[2]')
    expect(level).toBe('error')
    clear()
  })

  it('enable/disable', () => {
    let prefix, level

    const clear = () => {
      prefix = undefined
      level = undefined
    }

    console.warn =
      console.error =
      console.log =
        ($prefix) => {
          prefix = $prefix
        }

    let idx = 0

    const logger = createSimpleLogger((t) => {
      level = t
      return `[${idx++}]`
    })

    logger.log('hello')
    expect(prefix).toBe('[0]')
    expect(level).toBe('info')
    clear()

    logger.disable()
    logger.warn('hello')
    expect(prefix).toBe(undefined)
    expect(level).toBe(undefined)
    clear()

    logger.enable()
    logger.error('hello')
    expect(prefix).toBe('[1]')
    expect(level).toBe('error')
    clear()
  })
})
