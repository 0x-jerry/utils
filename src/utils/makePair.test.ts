import { makeDictPair, makePair } from './makePair'

describe('makePair', () => {
  it('should works with default value', () => {
    const handler = makePair({
      __default() {
        return 'cool'
      },
    })

    expect(handler('hhhh')).toEqual('cool')
  })

  it('should works with pair values', () => {
    const handler = makePair({
      __default() {
        return 'cool'
      },
      100() {
        return 100
      },
      xxx() {
        return 200
      },
    })

    expect(handler('100')).toEqual(100)
    expect(handler('xxx')).toEqual(200)

    expect(handler('200')).toEqual('cool')
  })

  it('should works with key/value', () => {
    const handler = makeDictPair({
      __default: 'cool',
      100: 100,
      xxx: 200,
    })

    expect(handler('100')).toEqual(100)
    expect(handler('xxx')).toEqual(200)

    expect(handler('200')).toEqual('cool')
  })
})
