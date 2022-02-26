interface KeyOption {
  key: KeyboardEvent['code']
  meta?: boolean
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
}

type KeyboardEventListener = (e: KeyboardEvent) => unknown

const specialKeys = ['meta', 'ctrl', 'alt', 'shift'] as const

type SpecialKey = typeof specialKeys[number]

const isSpecialKey = (key: string): key is SpecialKey => specialKeys.includes(key as SpecialKey)

const keyShortMap: Record<string, string> = {
  esc: 'Escape',
  enter: 'Enter',
  space: ' ',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
}

const splitSymbol = {
  split: ',',
  combo: '+',
} as const

function parseKeyOption(key: string) {
  const opt: KeyOption = {
    key: '',
    meta: false,
    ctrl: false,
    alt: false,
    shift: false,
  }

  const keys = key
    .split(splitSymbol.combo)
    .filter((n) => !!n.trim())
    .map((n) => {
      const s = n.trim()
      return keyShortMap[s] || s
    })

  for (const key of keys) {
    if (isSpecialKey(key)) opt[key] = true
    else opt.key = key
  }

  return opt
}

type InitializeEventListener = (listener: KeyboardEventListener) => void

/**
 *
 * @example
 * ```ts
 * const onKeydown = createKeyboardHandler((fn) => window.addEventListener('keydown', fn))
 *
 * onKeydown('meta+a, meta+b', () => {})
 *
 * onKeydown('meta+a', () => {})
 *
 * const stop = onKeydown('b', () => {})
 *
 * stop()
 * ```
 * @param initializeFn
 * @returns
 */
export const createKeyboardHandler = (initializeFn: InitializeEventListener) => {
  const events: Set<KeyboardEventListener> = new Set()

  initializeFn((e) => {
    const currentEvents = [...events]

    for (const evt of currentEvents) evt(e)
  })

  /**
   *
   * @param listener
   * @param opt
   * @returns cancel function
   */
  function handleListener(listener: KeyboardEventListener, opt: KeyOption) {
    const handler = (e: KeyboardEvent) => {
      const hit =
        !!opt.meta === e.metaKey &&
        !!opt.alt === e.altKey &&
        !!opt.shift === e.shiftKey &&
        !!opt.ctrl === e.ctrlKey &&
        opt.key === e.key

      if (hit) listener(e)
    }

    events.add(handler)

    return () => {
      events.delete(handler)
    }
  }

  return function handle(keys: string, listener: KeyboardEventListener) {
    const cancels = keys
      .split(splitSymbol.split)
      .map((key) => handleListener(listener, parseKeyOption(key)))

    return () => {
      for (const cancel of cancels) {
        cancel()
      }
    }
  }
}
