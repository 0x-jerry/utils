import { sleep } from '../core'
import { chain } from './chain'

describe('chainable', () => {
  const plusOne = (n: number) => n + 1
  const _toString = (n: number) => n.toString()

  const asyncPlusOne = async (n: number) => {
    await sleep(1)
    return n + 1
  }

  const asyncToString = async (n: number) => {
    await sleep(1)
    return n.toString()
  }

  it('should be chainable', () => {
    const s = chain(0)
      //
      .pipe(plusOne)
      .pipe(_toString)
      .done()

    expect(s).toBe('1')
  })

  it('should be reuseable', () => {
    const s = chain(0).pipe(plusOne)

    const s2 = s.pipe(_toString)

    expect(s2.done()).toBe('1')
    expect(s.done()).toBe(1)
  })

  it('should be an async chainable', async () => {
    const s = chain(0).pipe(plusOne).pipe(asyncPlusOne)
    expect(s.done()).instanceOf(Promise)
    expect(await s.done()).toBe(2)

    const s2 = s.pipe(asyncToString)
    expect(s2.done()).instanceOf(Promise)
    expect(await s2.done()).toBe('2')
  })

  it('should throw an error', async () => {
    const s = chain(0)
      .pipe(plusOne)
      .pipe((x) => {
        if (x) throw new Error('err')
        return x
      })
      .pipe(asyncPlusOne)

    expect(() => s.done()).toThrow('err')

    // async error
    const s1 = chain(0)
      .pipe(plusOne)
      .pipe(async (x) => {
        await sleep(1)
        throw 'async err'
      })
      .pipe(asyncPlusOne)

    await expect(s1.done()).rejects.toBe('async err')
  })
})
