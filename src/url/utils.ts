/**
 * Parse url, return false if input is not valid.
 *
 */
export function parseURL(input: string | URL, base?: string) {
  if (URL.canParse) {
    return URL.canParse(input, base) ? new URL(input, base) : false
  }

  try {
    return new URL(input, base)
  } catch (_error) {
    return false
  }
}

/**
 * Update searchParams by query with encodeURIComponent
 *
 * @example
 * ```ts
 * withQuery('http://example.com', { a: 1, b: false, c: 'xx' }) // => http://example.com?a=1&b=false&c=xx
 * ```
 *
 */
export function withQuery(input: string | URL, query: Record<string, any>) {
  const u = parseURL(input)

  if (!u) {
    throw new Error(`Parse URL failed!`)
  }

  Object.entries(query).forEach(([key, value]) => {
    u.searchParams.set(key, encodeURIComponent(String(value ?? '')))
  })

  return u
}
