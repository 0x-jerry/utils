/**
 * @example
 *
 * ```ts
 * parseURL('a') // => { path: 'a' }
 * parseURL('/a?b=1') // => { path: '/a', search: '?b=1' }
 * parseURL('http://localhost/a?b=1') // => { origin: 'http://localhost', path: '/a', search: '?b=1' }
 * parseURL('//localhost/a?b=1') // => { origin: '//localhost', path: '/a', search: '?b=1' }
 * parseURL('//localhost/a?b=1#333') // => { origin: '//localhost', path: '/a', search: '?b=1', hash: 333 }
 * ```
 * @param str
 */
export function parseURL(str: string): ParseURLResult {
  const urlRegexp =
    /^(?<origin>(\w+:)?\/\/[\w\d.:@]+)?(?<path>\/?[\w\d/]*)?(?<search>\??[^#]*)?(?<hash>#?.+)?$/

  const g = urlRegexp.exec(str)?.groups

  return {
    origin: g?.origin ?? '',
    path: g?.path ?? '',
    search: g?.search ?? '',
    hash: g?.hash ?? '',
    href: str,
  }
}

export interface ParseURLResult {
  origin: string
  path: string
  search: string
  hash: string
  href: string
}

export function isAbsolutePath(s: string) {
  return s.startsWith('/')
}
