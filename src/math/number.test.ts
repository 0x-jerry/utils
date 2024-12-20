import { clamp, round, toFixed, toRange } from './number'

describe('number', () => {
  it('toFixed', () => {
    expect(toFixed('12', 2)).toBe(12)

    expect(toFixed('12.0234', 2)).toBe(12.02)
    expect(toFixed(12.0234, 2)).toBe(12.02)

    expect(toFixed('12.2034', 2)).toBe(12.2)
    expect(toFixed(12.2034, 2)).toBe(12.2)

    expect(toFixed('.12', 2)).toBe(0.12)
    expect(toFixed('.002', 2)).toBe(0)

    expect(toFixed('as12', 2)).toBe(Number.NaN)
    expect(toFixed('a.12', 2)).toBe(Number.NaN)
  })

  it('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('round', () => {
    expect(round(1.023, 2)).toBe(1.02)

    // 12.07411 * 100 / 100
    expect(round(12.07411, 2)).toBe(12.07)

    expect(round(12.07511, 2)).toBe(12.08)

    expect(round(12.99511, 2)).toBe(13)
    expect(round(12.99411, 2)).toBe(12.99)
  })

  it('toRange', () => {
    expect(toRange(361, 0, 360)).toBe(1)
    expect(toRange(189, 0, 200)).toBe(189)

    expect(toRange(10, 20, 30)).oneOf([20, 30])

    expect(toRange(-10, 15, 30)).toBe(20)

    expect(toRange(-10, 0, 20)).toBe(10)

    expect(toRange(-15, -5, 5)).toBe(-5)
    expect(toRange(-10, -5, 5)).toBe(0)

    expect(toRange(101, 0, 10)).toBe(1)
    expect(toRange(-101, 0, 10)).toBe(9)

    expect(toRange(101, -20, -10)).toBe(-19)
    expect(toRange(-101, -20, -10)).toBe(-11)
  })
})
