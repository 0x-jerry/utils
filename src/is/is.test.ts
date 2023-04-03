import { noop } from '../core'
import {
  isArray,
  isAsyncIterable,
  isBoolean,
  isCls,
  isEmpty,
  isFn,
  isIterable,
  isNullish,
  isNumber,
  isObject,
  isPrimitive,
  isPromise,
  isPromiseLike,
  isString,
  isSymbol,
} from './is'

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

    run(units, isCls)
  })

  it('is number', () => {
    expect(isNumber(1)).toBe(true)

    expect(isNumber(0o1)).toBe(true)
    expect(isNumber(0x1)).toBe(true)

    expect(isNumber('123')).toBe(false)
  })

  it('is string', () => {
    expect(isString('')).toBe(true)

    expect(isString(1)).toBe(false)

    expect(isString({})).toBe(false)
  })

  it('is boolean', () => {
    expect(isBoolean(false)).toBe(true)

    expect(isBoolean(1)).toBe(false)
    expect(isBoolean('1')).toBe(false)
  })

  it('is symbol', () => {
    expect(isSymbol(Symbol())).toBe(true)
    expect(isSymbol(Symbol.for('xx'))).toBe(true)
    expect(isSymbol(1)).toBe(false)
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

    run(units, isFn)
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

    run(units, isArray)
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

    run(units, isObject)
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

    run(units, isIterable)
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

    run(units, isAsyncIterable)
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

    run(units, isEmpty)
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

    run(units, isNullish)
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

    run(units, isPrimitive)
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

    run(units, isPromise)

    run(
      [
        //
        [{ then: noop }, true],
        ...units,
      ],
      isPromiseLike
    )
  })
})

function run(collections: [unknown, boolean][], fn: (x: unknown) => boolean) {
  collections.forEach((item, idx) => {
    expect(fn(item[0]), `fn: ${fn.name}, idx: ${idx} failed`).toBe(item[1])
  })
}
