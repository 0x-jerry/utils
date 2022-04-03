import { createSingleton } from './createSingleton'

describe('create singleton', () => {
  it('should only call once', () => {
    const f = () => {
      return { a: 0 }
    }

    const fn = vi.fn().mockImplementation(f)

    const ins1 = createSingleton(fn)

    const ins2 = createSingleton(fn)

    expect(ins1).toBe(ins2)

    expect(fn).toBeCalledTimes(1)
  })

  it('should working with class', () => {
    const fn = vi.fn()

    class F {
      a = 0

      constructor() {
        fn()
      }
    }

    const ins1 = createSingleton(F)

    const ins2 = createSingleton(F)

    expect(ins1).toBe(ins2)

    expect(fn).toBeCalledTimes(1)
  })
})
