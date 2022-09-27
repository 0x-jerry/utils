import { toFixed } from './number'

describe('number', () => {
  it('toFixed', () => {
    expect(toFixed('12', 2)).toBe(12)

    expect(toFixed('12.0234', 2)).toBe(12.02)
    expect(toFixed(12.0234, 2)).toBe(12.02)

    expect(toFixed('12.2034', 2)).toBe(12.2)
    expect(toFixed(12.2034, 2)).toBe(12.2)

    expect(toFixed('.12', 2)).toBe(0.12)
    expect(toFixed('.002', 2)).toBe(0)

    expect(toFixed('as12', 2)).toBe(NaN)
    expect(toFixed('a.12', 2)).toBe(NaN)
  })
})
