import { parseURL } from "./parse"

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