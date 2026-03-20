import { sleep } from '../core'
import { Context } from './context'

describe('context', () => {
  class TestContext {
    count = 0

    constructor(init = 0) {
      this.count = init
    }

    add() {
      this.count++
    }
  }
  const Test = Context.create<InstanceType<typeof TestContext>>('test')

  it('should get context', () => {
    const main = vi.fn(() => {
      const t = Test.get()
      t.add()
      expect(t.count).toBe(1)
    })

    Context.run(main, [
      //
      Test.impl(new TestContext()),
    ])

    expect(main).toBeCalledTimes(1)
  })

  it('should get context in async runtime', async () => {
    const main = vi.fn(async () => {
      const t = Test.get()
      expect(t.count).toBe(0)
      await sleep(10)
      const t1 = Test.get()
      t1.add()
      expect(t1).toBe(t)
      expect(t1.count).toBe(1)
    })

    await Context.run(main, [
      //
      Test.impl(new TestContext()),
    ])

    expect(main).toBeCalledTimes(1)
  })

  it('should be isolated', async () => {
    const main = vi.fn(async () => {
      const t = Test.get()
      expect(t.count).toBe(0)
      await sleep(10)
      const t1 = Test.get()
      t1.add()
      expect(t1).toBe(t)
      expect(t1.count).toBe(1)
    })

    const main2 = vi.fn(async () => {
      const t = Test.get()
      expect(t.count).toBe(1)
      await sleep(10)
      const t1 = Test.get()
      t1.add()
      expect(t1).toBe(t)
      expect(t1.count).toBe(2)
    })

    const r1 = Context.run(main, [
      //
      Test.impl(new TestContext()),
    ])

    const r2 = Context.run(main2, [
      //
      Test.impl(new TestContext(1)),
    ])

    await Promise.all([r1, r2])

    expect(main).toBeCalledTimes(1)
    expect(main2).toBeCalledTimes(1)
  })
})
