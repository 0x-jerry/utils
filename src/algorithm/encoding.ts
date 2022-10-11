export function jsonToBase64(data: unknown) {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

export function base64ToJson(data: string) {
  return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
}
