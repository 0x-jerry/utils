import { is } from './is'

describe('is utils', () => {
  it('is class', () => {
    const A = class {}

    expect(is.classs(A)).toBe(true)

    expect(is.classs(function () {})).toBe(false)
  })

  it('is number', () => {
    expect(is.number(1)).toBe(true)

    expect(is.number(0o1)).toBe(true)
    expect(is.number(0x1)).toBe(true)

    expect(is.number('123')).toBe(false)
  })

  it('is string', () => {
    expect(is.string('')).toBe(true)

    expect(is.string(1)).toBe(false)

    expect(is.string({})).toBe(false)
  })

  it('is boolean', () => {
    expect(is.boolean(false)).toBe(true)

    expect(is.boolean(1)).toBe(false)
    expect(is.boolean('1')).toBe(false)
  })

  it('is fn', () => {
    expect(is.fn(() => {})).toBe(true)

    expect(is.fn(async () => {})).toBe(true)

    expect(is.fn(class A {})).toBe(false)
    expect(is.fn(1)).toBe(false)
    expect(is.fn('1')).toBe(false)
  })

  it('is array', () => {
    expect(is.array([])).toBe(true)

    expect(is.array(1)).toBe(false)
    expect(is.array(new Set())).toBe(false)
  })
})
