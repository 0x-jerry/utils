export const isWeb = !!globalThis.window && !!globalThis.document

export const isNode = !!globalThis.process?.versions?.node
