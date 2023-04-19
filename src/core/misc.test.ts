import { createAutoIncrementGenerator, has } from './misc'

describe('misc', () => {
  it('has', () => {
    expect(has({}, 'a')).toBe(false)

    expect(has({ a: 1 }, 'a')).toBe(true)

    const s = Symbol()

    expect(has({ [s]: 0 }, s)).toBe(true)
    expect(has({}, s)).toBe(false)
  })

  it('generate uuid', () => {
    const nextId = createAutoIncrementGenerator()

    expect(nextId()).toBe('0')
    expect(nextId()).toBe('1')

    const nextId2 = createAutoIncrementGenerator('p_')

    expect(nextId2()).toBe('p_0')
    expect(nextId2()).toBe('p_1')
  })
})
