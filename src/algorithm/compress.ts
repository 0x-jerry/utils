/**
 * Use {@link pako} to compress text
 *
 * Please note, you should install {@link pako} first
 *
 * @param text
 * @returns
 */
export async function compressText(text: string): Promise<string> {
  const pako = (await import('pako')).default

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
export async function decompressText(compressedText: string): Promise<string> {
  const pako = (await import('pako')).default

  const buf = Buffer.from(compressedText, 'base64')

  const restored = pako.inflate(buf, { to: 'string' })

  return restored
}
