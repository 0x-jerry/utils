import { toValue } from './toValue'

describe('toValue', () => {
  it('should be return an object', () => {
    expect(toValue(1)).toBe(1)

    expect(toValue(() => 1)).toBe(1)

    const fn = vi.fn()

    expect(toValue(() => fn)).toBe(fn)
  })
})
