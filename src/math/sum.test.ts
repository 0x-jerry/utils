import { sum } from './sum.js'

describe('sum', () => {
  it('should work with array', () => {
    expect(sum(1, 2, 3)).toBe(6)
  })
})
