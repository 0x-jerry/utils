import { compressText, decompressText } from './compress.js'

describe('compress / decompress text', () => {
  it('should compress and decompress', async () => {
    const txt = 'text123456'

    const compressed = await compressText(txt)

    expect(compressed).toBe('eJwrSa0oMTQyNjE1AwATMwL7')

    const decompressed = await decompressText(compressed)

    expect(decompressed).toBe(txt)
  })
})
