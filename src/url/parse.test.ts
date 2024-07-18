import { parseURL } from './parse.js'

describe('parse url', () => {
  it('should parse valid url', () => {
    const t = parseURL('/path/url', 'http://example.com')

    expect(t).toBeInstanceOf(URL)
  })

  it('should return false when parse failed', () => {
    const t = parseURL('/path')

    expect(t).toBe(false)
  })
})

describe('parse fallback', () => {
  let _canParse = URL.canParse
  beforeAll(() => {
    // @ts-ignore
    URL.canParse = undefined
  })
  afterAll(() => {
    URL.canParse = _canParse
  })

  it('should parse valid url', () => {
    expect(URL.canParse).toBeUndefined()

    const t = parseURL('/path/url', 'http://example.com')

    expect(t).toBeInstanceOf(URL)
  })

  it('should return false when parse failed', () => {
    expect(URL.canParse).toBeUndefined()

    const t = parseURL('/path')

    expect(t).toBe(false)
  })
})
