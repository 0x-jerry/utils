import { isObject } from './isObject'

describe('isObject', () => {
  it('null is not object', () => {
    expect(isObject(null)).toBe(false)
  })

  it('number is not object', () => {
    expect(isObject(1)).toBe(false)
  })

  it('object is not object', () => {
    expect(isObject({})).toBe(true)
  })
})
