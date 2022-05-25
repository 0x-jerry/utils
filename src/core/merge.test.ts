import { deepMerge } from './merge'

describe('deep merge', () => {
  it('merge simple object', () => {
    const r = deepMerge(
      {
        a: 1,
        c: '',
        d: false,
      },
      {
        c: '234',
      }
    )

    expect(r).eql({
      a: 1,
      c: '234',
      d: false,
    })
  })

  it('merge deep object', () => {
    const r = deepMerge(
      {
        a: 1,
        b: {
          a: '11',
          b: false,
        },
      },
      {
        b: {
          b: true,
        },
      }
    )

    expect(r).eql({
      a: 1,
      b: {
        a: '11',
        b: true,
      },
    })
  })

  it('merge with array', () => {
    const r = deepMerge(
      {
        a: 1,
        b: [],
        c: {
          b: [1],
        },
      },
      {
        b: [2],
      }
    )

    expect(r).eql({
      a: 1,
      b: [2],
      c: {
        b: [1],
      },
    })
  })

  it('merge with complex object', () => {
    const r = deepMerge(
      {
        a: 1,
        b: new Set(),
        c: new Map(),
        d: {
          a: new Map([[1, 1]]),
        },
      },
      {
        b: new Set([1]),
      },
      {
        d: {
          a: new Map([[2, 1]]),
        },
      }
    )

    expect(r).eql({
      a: 1,
      b: new Set([1]),
      c: new Map(),
      d: {
        a: new Map([[2, 1]]),
      },
    })
  })
})
