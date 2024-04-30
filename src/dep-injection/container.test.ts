import { Container } from './container'

interface A {
  a(): void
}

interface B {
  b(): void
}

interface CtorMap {
  a: A
  b: B
}

describe('container', () => {
  it('get', () => {
    const di = new Container<CtorMap>()

    const aCtor = vi.fn()

    class implA {
      a = vi.fn()
      constructor() {
        aCtor()
      }
    }

    di.bind('a', implA)

    const a = di.get('a')
    const a1 = di.get('a')

    expect(a).toBeInstanceOf(implA)
    expect(a1).toBeInstanceOf(implA)
    expect(a).not.toBe(a1)
  })

  it('singleton', () => {
    const di = new Container<CtorMap>()

    const aCtor = vi.fn()

    class implA {
      a = vi.fn()
      constructor() {
        aCtor()
      }
    }

    di.bind('a', implA, { singleton: true })

    const a = di.get('a')
    const a1 = di.get('a')

    expect(a).toBeInstanceOf(implA)
    expect(a1).toBeInstanceOf(implA)
    expect(a).toBe(a1)
    expect(aCtor).toBeCalledTimes(1)
  })

  it('get with target', () => {
    const di = new Container<CtorMap>()

    const aCtor = vi.fn()

    class implA {
      a = vi.fn()
      constructor() {
        aCtor()
      }
    }

    class implB {
      get a() {
        return di.get('a', { target: this })
      }

      get a2() {
        return di.get('a', { target: this })
      }

      b() {
        this.a.a()
        this.a2.a()
      }
    }

    di.bind('a', implA)
    di.bind('b', implB)

    const b = di.get('b')

    b.b()
    expect(aCtor).toBeCalledTimes(1)
  })
})
