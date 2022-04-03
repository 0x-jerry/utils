import { isClass } from './is'

describe('is utils', () => {
  it('is class', () => {
    const A = class {}

    expect(isClass(A)).toBe(true)

    expect(isClass(function () {})).toBe(false)
  })
})
