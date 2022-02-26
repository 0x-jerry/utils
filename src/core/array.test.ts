import { toArray } from './array'

describe('toArray', () => {
  it('array', () => {
    expect(toArray([1])).toEqual([1])
  })

  it('primary value', () => {
    expect(toArray(1)).toEqual([1])

    expect(toArray('')).toEqual([''])
  })

  it('2 dimension', () => {
    expect(toArray([[1], [2]])).toEqual([[1], [2]])
  })
})
