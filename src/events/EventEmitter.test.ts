import { EventEmitter } from './EventEmitter'

type Events = {
  test(): void
  foo(a: number): void
  bar(a: number, b: string): void
}

describe('EventEmitter', () => {
  it('should add a listener', () => {
    const ee = new EventEmitter<Events>()

    ee.on('bar', (a) => {
      expect(a).toBe(12)
    })

    ee.on('bar', (_, b) => {
      expect(b).toBe('123')
    })

    ee.emit('bar', 12, '123')
  })

  it('should only run once', () => {
    const ee = new EventEmitter<Events>()

    const fn = (x: number) => expect(x).toBe(12)

    ee.once('foo', fn)

    ee.emit('foo', 12)

    expect(ee.events('foo').size).toBe(0)
  })

  it('off', () => {
    const ee = new EventEmitter<Events>()

    const fn = () => {}
    ee.once('test', () => {})
    ee.once('test', fn)

    ee.once('foo', fn)

    ee.once('bar', fn)

    expect(ee.events('test').size).toBe(2)
    expect(ee.events('foo').size).toBe(1)
    expect(ee.events('bar').size).toBe(1)

    ee.off('test', fn)
    expect(ee.events('test').has(fn)).toBe(false)

    ee.off('test')
    expect(ee.events('test').size).toBe(0)

    ee.off()
    expect(Object.keys(ee.events()).length).toBe(0)
  })

  it('limit', () => {
    const ee = new EventEmitter<Events>(1)

    ee.on('test', () => {})

    expect(() => ee.on('test', () => {})).toThrow('Listeners reached limit size: 1')
    expect(() => ee.once('test', () => {})).toThrow('Listeners reached limit size: 1')
  })

  it('0 capacity size', () => {
    const ee = new EventEmitter<Events>(0)

    expect(ee.capacity).toBe(0)

    expect(() => {
      for (let index = 0; index < 30; index++) {
        ee.on('test', () => {})
      }
    }).not.throw()
  })

  it('on then off', () => {
    const ee = new EventEmitter<Events>()

    const fn = vi.fn()

    const off = ee.on('bar', () => fn())
    ee.emit('bar', 12, '123')

    off()

    expect(fn).toBeCalledTimes(1)
  })

  it("should not throw listener's error", () => {
    const ee = new EventEmitter<Events>()

    const fn = () => {
      throw new Error()
    }

    const fn2 = vi.fn()

    const off = ee.on('bar', () => fn())
    const off2 = ee.on('bar', fn2)

    ee.emit('bar', 12, '123')

    off()
    off2()

    expect(fn2).toBeCalledTimes(1)
  })
})
