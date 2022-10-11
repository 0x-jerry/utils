import pako from 'pako'

/**
 * use {@link pako} to compress text
 *
 * @param text
 * @returns
 */
export function compressText(text: string): string {
  const compressed = pako.deflate(text)

  return Buffer.from(compressed).toString('base64')
}

/**
 * use {@link pako} to decompress text
 *
 * @param compressedText
 * @returns
 */
export function decompressText(compressedText: string): string {
  const buf = Buffer.from(compressedText, 'base64')

  const restored = pako.inflate(buf, { to: 'string' })

  return restored
}
