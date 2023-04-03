import { noop } from '../core'
import { is } from './is'

describe('is utils', () => {
  it('is class', () => {
    const units: [unknown, boolean][] = [
      ['', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, false],
      [[], false],
      [new Map(), false],
      [new Set(), false],
      [() => {}, false],
      [async () => {}, false],
      [function fn() {}, false],
      [class A {}, true],
      [Promise.resolve(), false],
    ]

    run(units, is.cls)
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

  it('is symbol', () => {
    expect(is.symbol(Symbol())).toBe(true)
    expect(is.symbol(Symbol.for('xx'))).toBe(true)
    expect(is.symbol(1)).toBe(false)
  })

  it('is fn', () => {
    const units: [unknown, boolean][] = [
      ['', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, false],
      [[], false],
      [new Map(), false],
      [new Set(), false],
      [() => {}, true],
      [async () => {}, true],
      [function fn() {}, true],
      [class A {}, false],
      [Promise.resolve(), false],
    ]

    run(units, is.fn)
  })

  it('is array', () => {
    const units: [unknown, boolean][] = [
      ['', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, false],
      [[], true],
      [new Map(), false],
      [new Set(), false],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), false],
    ]

    run(units, is.array)
  })

  it('is object', () => {
    const units: [unknown, boolean][] = [
      ['', false],
      ['xx', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, true],
      [[], true],
      [new Map(), true],
      [new Set(), true],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), true],
    ]

    run(units, is.object)
  })

  it('is iterable', () => {
    const asyncIter = async function* () {
      yield 1
    }

    const units: [unknown, boolean][] = [
      ['', false],
      ['xx', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, false],
      [[], true],
      [new Map(), true],
      [new Set(), true],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), false],
      [asyncIter(), false],
    ]

    run(units, is.iterable)
  })

  it('is async iterable', () => {
    const asyncIter = async function* () {
      yield 1
    }

    const units: [unknown, boolean][] = [
      ['', false],
      ['xx', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, false],
      [[], false],
      [new Map(), false],
      [new Set(), false],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), false],
      [asyncIter(), true],
    ]

    run(units, is.asyncIterable)
  })

  it('is empty', () => {
    const units: [unknown, boolean][] = [
      ['', true],
      ['xx', false],
      [0, false],
      [0n, false],
      [Symbol(), false],
      [null, true],
      [undefined, true],
      [false, false],
      [{}, true],
      [{ x: 1 }, false],
      [[], true],
      [[1], false],
      [new Map(), true],
      [new Set(), true],
      [new Map().set(1, 1), false],
      [new Set([1]), false],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), false],
    ]

    run(units, is.empty)
  })

  it('is nullish', () => {
    const units: [unknown, boolean][] = [
      ['', false],
      [0, false],
      [1n, false],
      [Symbol(), false],
      [null, true],
      [undefined, true],
      [false, false],
      [{}, false],
      [[], false],
      [new Map(), false],
      [new Set(), false],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), false],
    ]

    run(units, is.nullish)
  })

  it('is primitive', () => {
    const units: [unknown, boolean][] = [
      ['', true],
      [0, true],
      [1n, true],
      [Symbol(), true],
      [null, true],
      [undefined, true],
      [false, true],
      [{}, false],
      [[], false],
      [new Map(), false],
      [new Set(), false],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), false],
    ]

    run(units, is.primitive)
  })

  it('is promise', () => {
    const units: [unknown, boolean][] = [
      ['', false],
      [0, false],
      [1n, false],
      [Symbol(), false],
      [null, false],
      [undefined, false],
      [false, false],
      [{}, false],
      [[], false],
      [new Map(), false],
      [new Set(), false],
      [() => {}, false],
      [function fn() {}, false],
      [class A {}, false],
      [Promise.resolve(), true],
    ]

    run(units, is.promise)

    run(
      [
        //
        [{ then: noop }, true],
        ...units,
      ],
      is.promiseLike
    )
  })
})

function run(collections: [unknown, boolean][], fn: (x: unknown) => boolean) {
  collections.forEach((item, idx) => {
    expect(fn(item[0]), `fn: ${fn.name}, idx: ${idx} failed`).toBe(item[1])
  })
}
