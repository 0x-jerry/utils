import { zlibSync, unzlibSync } from 'fflate'
import { isWeb } from '../utils'

const encoder = /*@__PURE__*/ new TextEncoder()
const decoder = /*@__PURE__*/ new TextDecoder()

/**
 * Use [fflate](https://github.com/101arrowz/fflate/) to compress text
 *
 * @param text
 * @returns
 */
export function compressText(text: string): string {
  const buffer = encoder.encode(text)

  const compressed = zlibSync(buffer)

  const base64 = isWeb
    ? window.btoa(String.fromCharCode(...compressed))
    : Buffer.from(compressed).toString('base64')

  return base64
}

/**
 * Use [fflate](https://github.com/101arrowz/fflate/) to decompress text
 *
 * @param compressedText
 * @returns
 */
export function decompressText(compressedText: string): string {
  const buffer = isWeb ? base64ToUint8(compressedText) : Buffer.from(compressedText, 'base64')

  const restored = unzlibSync(buffer)

  return decoder.decode(restored)
}

function base64ToUint8(b64: string) {
  const binaryString = window.atob(b64)

  const uint8Array = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i)
  }

  return uint8Array
}
