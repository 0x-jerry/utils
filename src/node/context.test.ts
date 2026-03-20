import { sleep } from '../core'
import { Context } from './context'

describe('context', () => {
  class CounterService {
    count = 0

    constructor(init = 0) {
      this.count = init
    }

    add() {
      this.count++
    }
  }
  const CounterContext = Context.create<InstanceType<typeof CounterService>>('test')

  it('should get context', async () => {
    const main = vi.fn(() => {
      const c = CounterContext.get()
      c.add()
      expect(c.count).toBe(1)
    })

    Context.run(main, [
      //
      CounterContext.impl(new CounterService()),
    ])

    expect(main).toHaveBeenCalledTimes(1)
  })

  it('should get context in async runtime', async () => {
    const main = vi.fn(async () => {
      const c = CounterContext.get()
      expect(c.count).toBe(0)
      await sleep(10)

      const c1 = CounterContext.get()
      c1.add()
      expect(c1).toBe(c)
      expect(c1.count).toBe(1)
    })

    await Context.run(main, [
      //
      CounterContext.impl(new CounterService()),
    ])

    expect(main).toHaveBeenCalledTimes(1)
  })

  it('should be isolated', async () => {
    const main = vi.fn(async () => {
      const t = CounterContext.get()
      expect(t.count).toBe(0)

      await sleep(10)

      const t1 = CounterContext.get()
      t1.add()
      expect(t1).toBe(t)
      expect(t1.count).toBe(1)
    })

    const main2 = vi.fn(async () => {
      const t = CounterContext.get()
      expect(t.count).toBe(1)

      await sleep(10)

      const t1 = CounterContext.get()
      t1.add()
      expect(t1).toBe(t)
      expect(t1.count).toBe(2)
    })

    const r1 = Context.run(main, [
      //
      CounterContext.impl(new CounterService()),
    ])

    const r2 = Context.run(main2, [
      //
      CounterContext.impl(new CounterService(1)),
    ])

    await Promise.all([r1, r2])

    expect(main).toHaveBeenCalledTimes(1)
    expect(main2).toHaveBeenCalledTimes(1)
  })

  it('should bind context in advance', async () => {
    const main = vi.fn(() => {
      const c = CounterContext.get()
      c.add()
      expect(c.count).toBe(2)
    })

    const bindContext = Context.bind(() => [CounterContext.impl(new CounterService(1))])

    bindContext.run(main)
    bindContext.run(main)

    expect(main).toHaveBeenCalledTimes(2)
  })
})
