import pako from 'pako'

/**
 * Use {@link pako} to compress text
 *
 * Please note, you should install {@link pako} first
 *
 * @param text
 * @returns
 */
export function compressText(text: string): string {
  const compressed = pako.deflate(text)

  return Buffer.from(compressed).toString('base64')
}

/**
 * Use {@link pako} to decompress text
 *
 * Please note, you should install {@link pako} first
 *
 * @param compressedText
 * @returns
 */
export function decompressText(compressedText: string): string {
  const buf = Buffer.from(compressedText, 'base64')

  const restored = pako.inflate(buf, { to: 'string' })

  return restored
}
