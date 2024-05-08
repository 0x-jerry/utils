import { getInstance } from './singleton.js'

describe('create singleton', () => {
  it('should only call once', () => {
    const f = () => {
      return { a: 0 }
    }

    const fn = vi.fn().mockImplementation(f)

    const ins1 = getInstance(fn)

    const ins2 = getInstance(fn)

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

    const ins1 = getInstance(F)

    const ins2 = getInstance(F)

    expect(ins1).toBe(ins2)

    expect(fn).toBeCalledTimes(1)
  })
})
