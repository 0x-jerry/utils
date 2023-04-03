import { compressText, decompressText } from './compress'

describe('compress / decompress text', () => {
  it('should compress and decompress', async () => {
    const txt = 'text123456'
    const compressed = await compressText(txt)
    const decompressed = await decompressText(compressed)

    expect(decompressed).toBe(txt)
  })
})
