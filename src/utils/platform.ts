export const isWeb = /*@__PURE__*/ (() => !!globalThis.window && !!globalThis.document)()

export const isNode = /*@__PURE__*/ (() => !!globalThis.process?.versions?.node)()
