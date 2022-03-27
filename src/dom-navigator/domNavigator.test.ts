// @jest-environment jsdom
import { createDomNavigator, KeyboardNavigatorOption, utils } from './domNavigator'

const getGlobalOffset = utils.getGlobalOffset

describe('get global offset', () => {
  it('#', () => {
    const fakeEl = {
      offsetTop: 0,
      offsetLeft: 0,
      offsetParent: {
        offsetTop: 1,
        offsetLeft: 2,
        offsetParent: {
          offsetTop: 1,
          offsetLeft: 2,
          offsetParent: null,
        },
      },
    }

    const [x, y] = getGlobalOffset(fakeEl as any)

    expect(x).toBe(2)
    expect(y).toBe(4)
  })
})

// Only for testing, mock offset
utils.getGlobalOffset = (el) => {
  const str = el.getAttribute('data-offset')

  return (str?.split(',').map((s) => parseInt(s)) as [number, number]) || [0, 0]
}

describe('keyboard navigator', () => {
  it('focus', () => {
    let times = 0
    let el: HTMLElement | null = null

    const nav = createNav({
      onfocus(e) {
        times++
        el = e
      },
    })

    nav.focus()

    expect(nav.activeElement?.id).toBe('1')
    expect(el).toBe(nav.activeElement)
    expect(times).toBe(1)

    nav.focus()
    expect(el).toBe(nav.activeElement)
    expect(times).toBe(1)
  })

  it('blur', () => {
    let times = 0
    let el: HTMLElement | null = null

    const nav = createNav({
      onblur(e) {
        times++
        el = e
      },
    })

    nav.focus()

    const activeEl = nav.activeElement

    nav.blur()

    expect(nav.activeElement).toBeFalsy()

    expect(el).toBe(activeEl)
    expect(times).toBe(1)

    nav.blur()
    expect(el).toBe(activeEl)
    expect(times).toBe(1)
  })

  it('disconnect element', () => {
    const nav = createNav()

    nav.focus()
    expect(nav.activeElement).toBeTruthy()

    nav.rootEl.remove()
    expect(nav.activeElement).toBeFalsy()
  })

  it('down', () => {
    const nav = createNav()

    nav.focus()

    nav.down()
    expect(nav.activeElement?.id).toBe('4')

    nav.down()
    expect(nav.activeElement?.id).toBe('7')

    nav.down()
    expect(nav.activeElement?.id).toBe('7')
  })

  it('up', () => {
    const nav = createNav()

    nav.focus()

    nav.down()
    nav.down()
    expect(nav.activeElement?.id).toBe('7')

    nav.up()
    expect(nav.activeElement?.id).toBe('4')

    nav.up()
    expect(nav.activeElement?.id).toBe('1')

    nav.up()
    expect(nav.activeElement?.id).toBe('1')
  })

  it('right', () => {
    const nav = createNav()

    nav.focus()

    nav.right()
    expect(nav.activeElement?.id).toBe('2')

    nav.right()
    expect(nav.activeElement?.id).toBe('3')

    nav.right()
    expect(nav.activeElement?.id).toBe('3')
  })

  it('left', () => {
    const nav = createNav()

    nav.focus()
    nav.right()
    nav.right()
    expect(nav.activeElement?.id).toBe('3')

    nav.left()
    expect(nav.activeElement?.id).toBe('2')

    nav.left()
    expect(nav.activeElement?.id).toBe('1')

    nav.left()
    expect(nav.activeElement?.id).toBe('1')
  })

  it('keyboard', () => {
    const fakeKeydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
    })

    let activeEl: HTMLElement | null = null
    let times = 0

    const nav = createNav({
      onenter(e) {
        times++
        activeEl = e
      },
    })

    nav.focus()
    window.dispatchEvent(fakeKeydownEvent)
    expect(nav.activeElement?.id).toBe('2')

    window.dispatchEvent(fakeKeydownEvent)
    expect(nav.activeElement?.id).toBe('3')

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
      })
    )

    expect(times).toBe(1)
    expect(activeEl).toBe(nav.activeElement)
  })

  it('move', () => {
    const nav = createNav()

    nav.focus()

    nav.right()
    expect(nav.activeElement?.id).toBe('2')

    nav.up()
    expect(nav.activeElement?.id).toBe('2')

    nav.down()
    expect(nav.activeElement?.id).toBe('5')

    nav.down()
    expect(nav.activeElement?.id).toBe('8')

    nav.right()
    expect(nav.activeElement?.id).toBe('9')

    nav.up()
    expect(nav.activeElement?.id).toBe('6')

    nav.up()
    expect(nav.activeElement?.id).toBe('3')

    nav.up()
    expect(nav.activeElement?.id).toBe('3')

    nav.left()
    expect(nav.activeElement?.id).toBe('2')

    nav.left()
    expect(nav.activeElement?.id).toBe('1')

    nav.left()
    expect(nav.activeElement?.id).toBe('1')
  })

  it('disable', () => {
    const nav = createNav()

    expect(nav.isEnable).toBe(true)

    nav.disable()
    expect(nav.isEnable).toBe(false)

    nav.left()
    expect(nav.activeElement).toBeFalsy()
  })

  it('set activeElement', () => {
    const nav = createNav()
    nav.focus()

    nav.right()
    expect(nav.activeElement?.id).toBe('2')
    const el = nav.activeElement!

    nav.right()
    expect(nav.activeElement?.id).toBe('3')

    nav.activeElement = el
    nav.right()
    expect(nav.activeElement?.id).toBe('3')
  })
})

function createNav(opt: Partial<KeyboardNavigatorOption> = {}) {
  const div = document.createElement('div')

  /**
   * layout is
   * 1 2 3
   * 4 5 6
   * 7 8 9
   */
  div.innerHTML = `
    <div style="width: 100px; height: 100px;" id="1" tabindex="-1" data-offset="0,0"></div>
    <div style="width: 100px; height: 100px;" id="2" tabindex="-1" data-offset="0,10"></div>
    <div style="width: 100px; height: 100px;" id="3" tabindex="-1" data-offset="0,20"></div>
    <div style="width: 100px; height: 100px;" id="4" tabindex="-1" data-offset="10,0"></div>
    <div style="width: 100px; height: 100px;" id="5" tabindex="-1" data-offset="10,10"></div>
    <div style="width: 100px; height: 100px;" id="6" tabindex="-1" data-offset="10,20"></div>
    <div style="width: 100px; height: 100px;" id="7" tabindex="-1" data-offset="20,0"></div>
    <div style="width: 100px; height: 100px;" id="8" tabindex="-1" data-offset="20,10"></div>
    <div style="width: 100px; height: 100px;" id="9" tabindex="-1" data-offset="20,20"></div>
  `

  document.body.appendChild(div)

  return createDomNavigator(div, opt)
}
