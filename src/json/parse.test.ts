import { parseJson } from './parse'

interface JsonResult {
  a: number
}

describe('json', () => {
  it('parse failed', () => {
    const r = parseJson("{a: '1}")

    expect(r).toEqual(undefined)
  })

  it('no transofrm', () => {
    const r = parseJson<JsonResult>(`{"a": 2}`)

    expect(r).toEqual({ a: 2 })
  })

  it('with transform', () => {
    const r = parseJson<JsonResult>(`{"a": 2}`, {
      transform() {
        return { a: 1 }
      },
    })

    expect(r).toEqual({ a: 1 })
  })
})
