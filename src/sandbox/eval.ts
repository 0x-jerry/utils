const AsyncFunction = (async () => {}).constructor

export interface MakeSaferEvalOption {
  /**
   * @default ['console']
   */
  allowedGlobalKeys?: string[]
}

/**
 *
 * It use {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction/AsyncFunction AsyncFunction}
 * to create a more safe runtime, it default only enable a very small set of global objects.
 *
 * If you want to enable more global objects. You can change `allowedGlobalkeys`.
 *
 * @example
 *
 * ```ts
 * const saferEval = createSaferEval()
 * const $ctx = { a: 0 }
 *
 * await saferEval('$ctx', '$.a = 1')($ctx)
 *
 * expect($ctx.a).toBe(1)
 * ```
 */
export function createSaferEval(opt: MakeSaferEvalOption = {}) {
  opt.allowedGlobalKeys ??= ['console']

  const { safeGlobalThis, forbiddenKeys } = _makeGlobalObjects(opt)
  const safeGlobalThisEntities = Object.entries(safeGlobalThis)

  const globalAllowedKeys = safeGlobalThisEntities.map((n) => n[0])
  const globalValues = safeGlobalThisEntities.map((n) => n[1])

  return saferEval

  function saferEval<Parameters extends unknown[] = unknown[]>(...parameters: string[]) {
    const code = parameters.at(-1)

    const parameterNames = parameters.slice(0, parameters.length - 1)

    const fn = AsyncFunction(
      ...globalAllowedKeys,
      ...parameterNames,
      ...forbiddenKeys,
      `'use strict';\n${code}`,
    )

    return async (...args: Parameters) => {
      await fn(...globalValues, ...args)
    }
  }
}

interface MakeGlobalObjectOption {
  allowedGlobalKeys?: string[]
}

function _makeGlobalObjects(opt: MakeGlobalObjectOption = {}) {
  const allGlobalKeys = _getAllGlobalKeys(opt)

  const safeGlobalThis: Record<string, unknown> = {}

  for (const key of allGlobalKeys.allowedKeys) {
    safeGlobalThis[key] ??= globalThis[key as GlobalKey]
  }

  safeGlobalThis.globalThis = safeGlobalThis
  safeGlobalThis.window = safeGlobalThis
  safeGlobalThis.global = safeGlobalThis
  if (safeGlobalThis.console) {
    safeGlobalThis.console = {
      ...globalThis.console,
    }
  }

  return {
    forbiddenKeys: allGlobalKeys.forbiddenKeys,
    safeGlobalThis,
  }
}

function _getAllGlobalKeys(opt: MakeGlobalObjectOption = {}) {
  const _ignoredKeys = [
    //
    'globalThis',
    'window',
    'global',
    'undefined',
    'eval',
    /^\d/,
  ] satisfies (GlobalKey | RegExp)[]

  const _builtinAllowedKeys: string[] = [
    'Number',
    'String',
    'Boolean',
    'BigInt',
    'Date',
    'RegExp',
    'Blob',
    'Array',
    'Set',
    'Map',
    'NaN',
    'Infinity',
  ] satisfies GlobalKey[]

  const allowedKeys: string[] = []
  const forbiddenKeys: string[] = []

  for (const key of Object.getOwnPropertyNames(globalThis)) {
    if (isIgnored(key)) {
      continue
    }

    if (_builtinAllowedKeys.includes(key) || opt.allowedGlobalKeys?.includes(key)) {
      allowedKeys.push(key)
      continue
    }

    forbiddenKeys.push(key)
  }

  return {
    allowedKeys,
    forbiddenKeys,
  }

  function isIgnored(key: string) {
    return _ignoredKeys.some((n) => (typeof n === 'string' ? n === key : n.test(key)))
  }
}

type GlobalKey = keyof typeof globalThis
