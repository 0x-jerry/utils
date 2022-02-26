import { sleep } from '../core'
import { LRU } from './LRU'

describe('LRU', () => {
  it('count', () => {
    const lru = new LRU({ limit: 2 })

    lru.set('1', '1')
    lru.set('1', '1')
    expect(lru._cache.size).toBe(1)

    lru.set('2', '2')
    expect(lru._cache.size).toBe(2)

    lru.set('3', '3')
    expect(lru._cache.size).toBe(2)

    expect([...lru._cache.keys()]).toEqual(['2', '3'])
  })

  it('maxAge', async () => {
    const lru = new LRU({ maxAge: 1 })
    lru.set('1', '1')
    expect(lru.get('1')).toBe('1')

    await sleep(10)
    expect(lru.get('1')).toBeUndefined()
  })

  it('unset key', async () => {
    const lru = new LRU({ maxAge: 1 })
    expect(lru.get('1')).toBeUndefined()
  })

  it('reset', async () => {
    const lru = new LRU()
    lru.set('1', '1')
    expect(lru.get('1')).toBe('1')

    lru.reset()
    expect(lru.get('1')).toBeUndefined()
  })

  it('set', () => {
    const lru = new LRU<number, number>({ limit: 2 })

    lru.set(2, 1)
    lru.set(2, 2)
    expect(lru._cache.size).toBe(1)

    expect(lru.get(2)).toBe(2)

    lru.set(1, 1)
    expect(lru._cache.size).toBe(2)

    lru.set(4, 1)
    expect(lru._cache.size).toBe(2)

    expect(lru.get(2)).toBeUndefined()
  })

  it('get', () => {
    const lru = new LRU<number, number>({ limit: 2 })

    lru.set(1, 1)
    lru.set(2, 2)
    expect(lru._cache.size).toBe(2)

    expect(lru.get(1)).toBe(1)

    lru.set(3, 3)
    expect(lru.get(2)).toBeUndefined()

    lru.set(4, 4)
    expect(lru.get(1)).toBeUndefined()
    expect(lru.get(3)).toBe(3)
    expect(lru.get(4)).toBe(4)
  })

  it('random test', () => {
    const lru = new LRU<number, number>({ limit: 1 })

    lru.set(2, 1)
    expect(lru._cache.size).toBe(1)

    expect(lru.get(2)).toBe(1)

    lru.set(3, 2)
    expect(lru._cache.size).toBe(1)
    expect(lru.get(2)).toBeUndefined()

    expect(lru.get(3)).toBe(2)
  })

  it('random test 2', () => {
    const lru = new LRU<number, number>({ limit: 1 })

    expect(lru.get(6)).toBeUndefined()
    expect(lru.get(8)).toBeUndefined()
    expect(lru._cache.size).toBe(0)

    lru.set(12, 1)
    expect(lru._cache.size).toBe(1)

    expect(lru.get(2)).toBeUndefined()

    lru.set(15, 11)
    expect(lru._cache.size).toBe(1)
    lru.set(5, 2)
    expect(lru._cache.size).toBe(1)
    lru.set(1, 15)
    expect(lru._cache.size).toBe(1)
    lru.set(4, 2)
    expect(lru._cache.size).toBe(1)

    expect(lru.get(5)).toBeUndefined()

    lru.set(15, 15)
    expect(lru._cache.size).toBe(1)
  })
})
