function isWebPlatform() {
  return !!globalThis.window && !!globalThis.document
}

export const isWeb = /*@__PURE__*/ isWebPlatform()

function isNodePlatform() {
  return !!globalThis.process?.versions?.node
}

export const isNode = /*@__PURE__*/ isNodePlatform()
