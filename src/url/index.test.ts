import { parseURL, withQuery } from './utils'

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
  const _canParse = URL.canParse
  beforeAll(() => {
    // @ts-expect-error
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

describe('URL utils', () => {
  it('#withQuery', () => {
    const u = withQuery('http://example.com', { a: 1, b: false, c: 'xx' })

    expect(u.toString()).toBe('http://example.com/?a=1&b=false&c=xx')
  })
})
