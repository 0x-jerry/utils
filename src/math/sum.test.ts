import { sum } from './sum'

describe('sum', () => {
  it('should work with array', () => {
    expect(sum(1, 2, 3)).toBe(6)
  })
})
