import { zlibSync, unzlibSync } from 'fflate'
import { isWeb } from '../utils'

const encoder = /*@__PURE__*/ new TextEncoder()

/**
 * Use {@link fflate} to compress text
 *
 * Please note, you should install {@link pako} first
 *
 * @param text
 * @returns
 */
export function compressText(text: string): string {
  const buffer = encoder.encode(text)

  const compressed = zlibSync(buffer)

  if (isWeb) {
    const base64 = window.btoa(String.fromCharCode(...compressed))

    return base64
  }

  return Buffer.from(compressed).toString('base64')
}

/**
 * Use {@link fflate} to decompress text
 *
 * Please note, you should install {@link pako} first
 *
 * @param compressedText
 * @returns
 */
export function decompressText(compressedText: string): string {
  const buffer = isWeb
    ? encoder.encode(window.atob(compressedText))
    : Buffer.from(compressedText, 'base64')

  const restored = unzlibSync(buffer)

  return String.fromCharCode(...restored)
}
