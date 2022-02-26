import { createKeyboardHandler } from '../keyboard-events'

export type KeyboardDir = 'left' | 'right' | 'up' | 'down'

export interface KeyboardNavigatorOption {
  onfocus: (e: HTMLElement) => any
  onblur: (e: HTMLElement) => any
  onenter: (e: HTMLElement) => any
  /**
   * Get all elements that should navigated.
   */
  getElements: (rootEl: HTMLElement) => NodeListOf<HTMLElement>
}

function defaultGetElements(rootEl: HTMLElement) {
  return rootEl.querySelectorAll(`[tabindex='-1']`) as NodeListOf<HTMLElement>
}

function defaultOnfocus(el: HTMLElement) {
  el.focus()
}

function defaultOnblur(el: HTMLElement) {
  el.blur()
}

export class KeyboardNavigator {
  #handleKeydown

  #cancelHandler: (() => void)[] = []

  #isEnable = false

  #activeElement: HTMLElement | null = null

  get #elements() {
    return this.#opt.getElements(this.rootEl)
  }

  get activeElement() {
    if (this.#activeElement?.isConnected) {
      return this.#activeElement
    }

    this.#setActive(null)

    return null
  }

  set activeElement(el: HTMLElement | null) {
    this.#setActive(el)
  }

  get isEnable() {
    return this.#isEnable
  }

  #opt: KeyboardNavigatorOption

  constructor(public readonly rootEl: HTMLElement, opt: Partial<KeyboardNavigatorOption> = {}) {
    const defaultOption: KeyboardNavigatorOption = {
      onfocus: defaultOnfocus,
      onblur: defaultOnblur,
      onenter: () => {},
      getElements: defaultGetElements,
    }

    this.#opt = Object.assign(defaultOption, opt)

    this.#handleKeydown = createKeyboardHandler((listener) => {
      // Compatible with deno.
      globalThis.window.addEventListener('keydown', listener)
    })

    this.enable()
  }

  #setActive(el: HTMLElement | null) {
    if (this.#activeElement) {
      this.#opt.onblur(this.#activeElement)
    }

    if (el) {
      this.#activeElement = el
      this.#opt.onfocus(el)
    } else {
      this.#activeElement = el
    }
  }

  #move(dir: KeyboardDir) {
    if (!this.activeElement) return

    const nextElements = getNestElements(this.activeElement, this.#elements)

    const el = nextElements[dir]

    if (!el) return

    this.#setActive(el)
  }

  enable() {
    this.#isEnable = true

    this.#cancelHandler = [
      this.#handleKeydown('up', () => this.up()),
      this.#handleKeydown('down', () => this.down()),
      this.#handleKeydown('left', () => this.left()),
      this.#handleKeydown('right', () => this.right()),
      this.#handleKeydown('enter', () => {
        if (this.activeElement) {
          this.#opt.onenter(this.activeElement)
        }
      }),
    ]
  }

  disable() {
    this.#isEnable = false

    this.#cancelHandler.forEach((cancel) => cancel())
  }

  focus() {
    if (this.activeElement) return

    const el = this.#elements[0]
    this.#setActive(el)
  }

  blur() {
    this.#setActive(null)
  }

  up() {
    this.#move('up')
  }

  down() {
    this.#move('down')
  }

  left() {
    this.#move('left')
  }

  right() {
    this.#move('right')
  }
}

function getNestElements(
  activeElement: HTMLElement,
  elements: HTMLElement[] | NodeListOf<HTMLElement>
) {
  const nextEl: Record<KeyboardDir, HTMLElement | null> = {
    up: null,
    down: null,
    left: null,
    right: null,
  }

  const [activeTop, activeLeft] = utils.getGlobalOffset(activeElement)

  for (const item of elements) {
    if (item === activeElement) continue

    const [currentTop, currentLeft] = utils.getGlobalOffset(item)

    const offsetY = activeTop - currentTop
    const offsetX = activeLeft - currentLeft

    const isVertical = Math.abs(offsetY) > Math.abs(offsetX)

    const dir: KeyboardDir = isVertical
      ? offsetY > 0
        ? 'up'
        : 'down'
      : offsetX > 0
      ? 'left'
      : 'right'

    if (!nextEl[dir]) {
      nextEl[dir] = item
    } else {
      const [nTop, nLeft] = utils.getGlobalOffset(nextEl[dir]!)

      const dItem = distance(activeTop, activeLeft, currentTop, currentLeft)
      const dNext = distance(activeTop, activeLeft, nTop, nLeft)

      if (dItem < dNext) {
        nextEl[dir] = item
      }
    }
  }

  return nextEl
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2
}

export const utils = {
  /**
   *
   * @param el
   * @returns [top, left]
   */
  getGlobalOffset(el: HTMLElement) {
    let top = 0
    let left = 0

    let current: HTMLElement | null = el

    while (current) {
      top += current.offsetTop
      left += current.offsetLeft

      current = current.offsetParent as HTMLElement | null
    }

    return [top, left] as const
  },
}

export function createDomNavigator(
  rootEl: HTMLElement,
  opt: Partial<KeyboardNavigatorOption> = {}
) {
  return new KeyboardNavigator(rootEl, opt)
}
