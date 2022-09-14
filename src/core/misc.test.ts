import { createUUIDGenerator, hasOwn } from './misc'

describe('misc', () => {
  it('hasOwn', () => {
    expect(hasOwn({}, 'a')).toBe(false)

    expect(hasOwn({ a: 1 }, 'a')).toBe(true)

    const s = Symbol()

    expect(hasOwn({ [s]: 0 }, s)).toBe(true)
    expect(hasOwn({}, s)).toBe(false)
  })

  it('generate uuid', () => {
    const nextId = createUUIDGenerator()

    expect(nextId()).toBe('0')
    expect(nextId()).toBe('1')

    const nextId2 = createUUIDGenerator('p_')

    expect(nextId2()).toBe('p_0')
    expect(nextId2()).toBe('p_1')
  })
})
