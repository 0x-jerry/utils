import { compressText, decompressText } from './compress'

describe('compress / decompress text', () => {
  it('should compress and decompress', () => {
    const txt = 'text123456'
    const compressed = compressText(txt)
    const decompressed = decompressText(compressed)

    expect(decompressed).toBe(txt)
  })
})
