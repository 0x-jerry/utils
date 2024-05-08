import { ensureArray, group, remove } from './array.js'

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
    const item = [1, 2, { a: 1 }]

    expect(remove(item, 2)).toBe(1)
    expect(item).toEqual([1, { a: 1 }])
    expect(remove(item, (o: any) => o.a === 1)).toBe(1)
    expect(item).toEqual([1])
  })

  it('should return -1', () => {
    const item = [1, 2]

    expect(remove(item, 3)).toBe(-1)
    expect(remove(item, (o) => o === 3)).toBe(-1)
    expect(item).toEqual([1, 2])
  })
})

describe('group', () => {
  it('should group by string', () => {
    const items = [
      { type: 1, name: '1' },
      { type: 1, name: '2' },
      { type: 2, name: '3' },
    ]

    const result = group(items, (item) => item.type)

    expect(result).toMatchSnapshot()
  })

  it('should group by object', () => {
    const keys = [{ key: 1 }, { key: 2 }]

    const items = [
      { type: keys[0], name: '1' },
      { type: keys[0], name: '2' },
      { type: keys[1], name: '3' },
    ]

    const result = group(items, (item) => item.type)

    expect(result).toMatchSnapshot()
  })
})
