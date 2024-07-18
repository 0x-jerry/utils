import { Container } from './container.js'

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

  it('#clear', () => {
    class A {
      a = vi.fn()
    }

    class B {
      b = vi.fn()
    }

    const di = new Container<CtorMap>()
    di.bind('a', A)
    di.bind('b', B)

    expect(di.get('a')).toBeTruthy()
    di.clear('a')

    expect(() => di.get('a')).toThrowError('Key a is not binding.')
    expect(di.get('b')).toBeTruthy()

    di.clear()
    expect(() => di.get('a')).toThrowError('Key a is not binding.')
    expect(() => di.get('b')).toThrowError('Key b is not binding.')
  })

  it('should work with function', () => {
    const di = new Container<CtorMap>()
    const fnA = vi.fn()
    const fnB = vi.fn()

    di.bind('a', () => ({ a: fnA }))
    di.bind('b', () => ({ b: fnB }))

    expect(di.get('a').a).toBe(fnA)
    expect(di.get('b').b).toBe(fnB)
  })

  it('should work with object', () => {
    const di = new Container<CtorMap>()
    const fnA = vi.fn()
    const fnB = vi.fn()

    di.bind('a', { a: fnA })
    di.bind('b', { b: fnB })

    expect(di.get('a').a).toBe(fnA)
    expect(di.get('b').b).toBe(fnB)
  })

  it('bind with the same key should throw a error', () => {
    const di = new Container<CtorMap>()
    const fnA = vi.fn()
    const fnB = vi.fn()

    di.bind('a', { a: fnA })

    expect(() => di.bind('a', { a: fnB })).toThrow('Key a has set!')
  })
})

describe('ES decorator', () => {
  interface A {}
  interface B {
    a: A
  }

  interface C {
    b: B
  }

  interface DIMap {
    a: A
    b: B
    c: C
  }

  it('get', () => {
    const DI = new Container<DIMap>()
    class ImplA implements A {}

    class ImplB implements B {
      @DI.inject('a')
      a!: A
    }

    class ImplC implements C {
      @DI.lazyInject('b')
      b!: B
    }

    DI.bind('a', ImplA)
    DI.bind('b', ImplB)
    DI.bind('c', ImplC)

    const c = DI.get('c')

    expect(c).instanceOf(ImplC)
    expect(c.b).instanceof(ImplB)
    expect(c.b.a).instanceof(ImplA)
  })
})
