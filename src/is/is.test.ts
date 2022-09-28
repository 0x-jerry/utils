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

  it('is object', () => {
    expect(is.object(null)).toBe(false)

    expect(is.object(1)).toBe(false)

    expect(is.object({})).toBe(true)
  })

  it('is iterable', () => {
    expect(is.iterable({})).toBe(false)
    expect(is.iterable(0)).toBe(false)

    expect(is.iterable([])).toBe(true)
  })

  it('is empty', () => {
    const iter = function* (opt: any[]) {
      for (const item of opt) {
        yield item
      }
      return
    }

    //
    expect(is.empty(0)).toBe(false)
    expect(is.empty(false)).toBe(false)
    expect(is.empty(true)).toBe(false)
    expect(is.empty(() => {})).toBe(false)

    //
    expect(is.empty({ a: 1 })).toBe(false)
    expect(is.empty('0')).toBe(false)
    expect(is.empty([0])).toBe(false)
    expect(is.empty(new Set([0]))).toBe(false)
    expect(is.empty(new Map([[0, 0]]))).toBe(false)
    expect(is.empty(iter([1]))).toBe(false)

    //
    expect(is.empty({})).toBe(true)
    expect(is.empty('')).toBe(true)
    expect(is.empty([])).toBe(true)
    expect(is.empty(new Set())).toBe(true)
    expect(is.empty(new Map())).toBe(true)
    expect(is.empty(iter([]))).toBe(true)
  })

  it('is nullish', () => {
    expect(is.nullish('')).toBe(false)
    expect(is.nullish(0)).toBe(false)
    expect(is.nullish(false)).toBe(false)

    expect(is.nullish(undefined)).toBe(true)
    expect(is.nullish(null)).toBe(true)
  })

  it('is primitive', () => {
    expect(is.primitive('')).toBe(true)
    expect(is.primitive(0)).toBe(true)
    expect(is.primitive(1n)).toBe(true)
    expect(is.primitive(Symbol())).toBe(true)
    expect(is.primitive(null)).toBe(true)
    expect(is.primitive(undefined)).toBe(true)
    expect(is.primitive(false)).toBe(true)

    expect(is.primitive({})).toBe(false)
    expect(is.primitive([])).toBe(false)

    expect(is.primitive(new Map())).toBe(false)
    expect(is.primitive(new Set())).toBe(false)

    expect(is.primitive(() => {})).toBe(false)
    expect(is.primitive(class A {})).toBe(false)
    expect(is.primitive(function () {})).toBe(false)
  })
})
