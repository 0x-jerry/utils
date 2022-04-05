import { is } from './is'

describe('is utils', () => {
  it('is class', () => {
    const A = class {}

    expect(is.classs(A)).toBe(true)

    expect(is.classs(function () {})).toBe(false)
  })
})
