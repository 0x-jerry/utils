import { parseURL } from './utils'

describe('parse url', () => {
  it('should working with full url schema', () => {
    expect(parseURL('a')).eql({ origin: '', path: 'a', search: '', hash: '', href: 'a' })
    expect(parseURL('/a?b=1')).eql({
      origin: '',
      path: '/a',
      search: '?b=1',
      hash: '',
      href: '/a?b=1',
    })
    expect(parseURL('http://localhost/a?b=1')).eql({
      origin: 'http://localhost',
      path: '/a',
      search: '?b=1',
      hash: '',
      href: 'http://localhost/a?b=1',
    })
    expect(parseURL('//localhost/a?b=1')).eql({
      origin: '//localhost',
      path: '/a',
      search: '?b=1',
      hash: '',
      href: '//localhost/a?b=1',
    })
    expect(parseURL('//localhost/a?b=1#333')).eql({
      origin: '//localhost',
      path: '/a',
      search: '?b=1',
      hash: '#333',
      href: '//localhost/a?b=1#333',
    })
  })
})
