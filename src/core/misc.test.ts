import { has } from './misc'

describe('misc', () => {
  it('has', () => {
    expect(has({}, 'a')).toBe(false)

    expect(has({ a: 1 }, 'a')).toBe(true)

    const s = Symbol()

    expect(has({ [s]: 0 }, s)).toBe(true)
    expect(has({}, s)).toBe(false)
  })
})
