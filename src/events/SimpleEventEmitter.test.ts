import { SimpleEventEmitter } from './SimpleEventEmitter'

describe('SimpleEventEmitter', () => {
  it('#on', () => {
    const emitter = new SimpleEventEmitter()

    const fn = vi.fn()
    emitter.on(fn)

    expect(fn).toBeCalledTimes(0)
    emitter.emit()
    expect(fn).toBeCalledTimes(1)
  })

  it('#off', () => {
    const emitter = new SimpleEventEmitter()

    const fn = vi.fn()
    const dispose = emitter.on(fn)

    dispose()

    emitter.emit()
    expect(fn).toBeCalledTimes(0)
  })
})
