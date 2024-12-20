import { ensureArray, remove } from './array'

describe('ensureArray', () => {
  it('array', () => {
    expect(ensureArray([1])).toEqual([1])
  })

  it('primary value', () => {
    expect(ensureArray(1)).toEqual([1])

    expect(ensureArray('')).toEqual([''])
  })

  it('2 dimension', () => {
    expect(ensureArray([[1], [2]])).toEqual([[1], [2]])
  })

  it('should be empty array when value is null', () => {
    expect(ensureArray(null)).eqls([])
    expect(ensureArray(undefined)).eqls([])
    expect(ensureArray(0)).eqls([0])
  })
})

describe('remove', () => {
  it('should remove exists item', () => {
    const arrItem = { a: 1 }
    const item = [1, 2, arrItem]

    expect(remove(item, 2)).toEqual([2])
    expect(item).toEqual([1, arrItem])

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    expect(remove(item, (o: any) => o.a === 1)).toEqual([arrItem])
    expect(item).toEqual([1])
  })

  it('should return []', () => {
    const item = [1, 2]

    expect(remove(item, 3)).toEqual([])
    expect(remove(item, (o) => o === 3)).toEqual([])
    expect(item).toEqual([1, 2])
  })

  it('should remove mulitple items', () => {
    const item = [1, 2, 3, 4, 5, 6]

    expect(remove(item, (n) => n > 2 && n < 5)).toEqual([3, 4])
    expect(item).toEqual([1, 2, 5, 6])
  })

  it('should remove all items', () => {
    const item = [1, 2, 3, 4, 5, 6]

    expect(remove(item, (n) => n > 0)).toEqual([1, 2, 3, 4, 5, 6])
    expect(item).toEqual([])
  })
})
