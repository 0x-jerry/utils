import { hasOwn } from './misc'

describe('misc', () => {
  it('hasOwn', () => {
    expect(hasOwn({}, 'a')).toBe(false)

    expect(hasOwn({ a: 1 }, 'a')).toBe(true)
  })
})
