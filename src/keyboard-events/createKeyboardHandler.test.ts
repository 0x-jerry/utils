/**
 * @jest-environment jsdom
 */

import { createKeyboardHandler } from './createKeyboardHandler'

describe('crateKeyboardHandler', () => {
  const onKeydown = createKeyboardHandler((fn) =>
    window.addEventListener('keydown', (e) => {
      // const inputTags: string[] = ['INPUT', 'TEXTAREA']
      // const isInput = inputTags.includes(document.activeElement?.nodeName || '')
      // if (isInput) return

      fn(e)
    }),
  )

  it('on', () => {
    const fakeKeydownEvent = new KeyboardEvent('keydown', {
      key: 'k',
    })

    const fn = vi.fn()

    onKeydown('k', fn)

    window.dispatchEvent(fakeKeydownEvent)
    expect(fn).toBeCalledTimes(1)

    window.dispatchEvent(fakeKeydownEvent)
    expect(fn).toBeCalledTimes(2)
  })

  it('cancel', () => {
    const fakeKeydownEvent = new KeyboardEvent('keydown', {
      key: 'k',
    })

    const fn = vi.fn()

    const cancel = onKeydown('k', fn)

    window.dispatchEvent(fakeKeydownEvent)
    expect(fn).toBeCalledTimes(1)

    cancel()
    window.dispatchEvent(fakeKeydownEvent)
    expect(fn).toBeCalledTimes(1)
  })

  it('special key', () => {
    const fakeKeydownEvent = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })

    const fn = vi.fn()

    onKeydown('meta + k', fn)

    window.dispatchEvent(fakeKeydownEvent)
    expect(fn).toBeCalledTimes(1)
  })

  it('multi shortcuts', () => {
    const fakeKeydownEvent = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })

    const fn = vi.fn()

    onKeydown('meta+k, meta+o', fn)

    window.dispatchEvent(fakeKeydownEvent)
    expect(fn).toBeCalledTimes(1)

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'o',
        metaKey: true,
      }),
    )

    expect(fn).toBeCalledTimes(2)
  })
})
