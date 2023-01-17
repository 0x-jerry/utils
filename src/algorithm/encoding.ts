import { isNode } from '../utils'

export function jsonToBase64(data: unknown) {
  const s = JSON.stringify(data)
  return isNode ? Buffer.from(s).toString('base64') : globalThis.window.btoa(s)
}

export function base64ToJson(data: string) {
  const s = isNode ? Buffer.from(data, 'base64').toString('utf-8') : globalThis.window.atob(data)
  return JSON.parse(s)
}
