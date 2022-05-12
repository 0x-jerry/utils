import { composeUrl } from './core'
import { AlpsRequestConfig } from './types'

describe('compose url', () => {
  it('should working with baseURL', () => {
    const conf: AlpsRequestConfig = { baseURL: '/path' }

    expect(composeUrl('', conf)).toBe('/path')

    expect(composeUrl('a', conf)).toBe('/path/a')

    expect(composeUrl('/a', conf)).toBe('/a')

    expect(composeUrl('http://localhost/b', conf)).toBe('http://localhost/b')
  })

  it('should working with host', () => {
    const conf: AlpsRequestConfig = { baseURL: 'http://localhost/path' }

    expect(composeUrl('', conf)).toBe('http://localhost/path')

    expect(composeUrl('a', conf)).toBe('http://localhost/path/a')

    expect(composeUrl('/a', conf)).toBe('/a')
  })
})
