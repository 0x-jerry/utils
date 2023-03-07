import { range } from './range'

describe('range', () => {
  it('should generate only end', () => {
    expect(range(2)).eql([0, 1, 2])
    expect(range(-2)).eql([0, -1, -2])
  })

  it('should generate with start and end', () => {
    expect(range(1, 3)).eql([1, 2, 3])

    expect(range(5, 1)).eql([5, 4, 3, 2, 1])
  })

  it('should work with step', () => {
    expect(range(1, 10, 2)).eql([1, 3, 5, 7, 9])
    expect(range(0, 5, 2)).eql([0, 2, 4])
    expect(range(-10, 0, 2)).eql([-10, -8, -6, -4, -2, 0])
  })
})
