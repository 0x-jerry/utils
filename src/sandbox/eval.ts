import type { Fn } from '../types'

const AsyncFunction = (async () => {}).constructor

export interface MakeSaferEvalOption {
  /**
   * @default ['console']
   */
  allowedGlobalKeys?: string[]
  /**
   * Extends global objects
   */
  globals?: Record<string, unknown>
  /**
   * If allow side effects is true, then it will use global version of that function,
   * which may cause memory leak if not clear the side effect.
   *
   * By default, it will create a side effect free version of those function.
   *
   * @todo not implement
   */
  allowSideEffects?: {
    /**
     * Auto call clearTimeout after execution is done
     */
    setTimeout?: boolean
    /**
     * Auto call clearInterval after execution is done
     */
    setInterval?: boolean
    /**
     * Auto call cancelAnimationFrame after execution is done
     */
    requestAnimationFrame?: boolean
    /**
     * Auto call cancelIdleCallback after execution is done
     */
    requestIdleCallback?: boolean
    /**
     * This will create a AbortController for all fetch calls, and it will
     * call abort() after execution is done
     */
    fetch?: boolean
  }
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

  if (opt.globals) {
    opt.allowedGlobalKeys.push(...Object.keys(opt.globals))
  }

  const { safeGlobalThis, forbiddenKeys } = _makeGlobalObjects(opt)

  const extendedGlobalThis = {
    ...safeGlobalThis,
    ...opt.globals,
  }

  const safeGlobalThisEntities = Object.entries(extendedGlobalThis)

  const globalAllowedKeys = safeGlobalThisEntities.map((n) => n[0])
  const globalValues = safeGlobalThisEntities.map((n) => n[1])

  return saferEval

  function saferEval<T extends Fn>(...parameters: string[]) {
    const code = parameters.at(-1)

    const parameterNames = parameters.slice(0, parameters.length - 1)

    const fn = AsyncFunction(
      ...globalAllowedKeys,
      ...parameterNames,
      ...forbiddenKeys,
      `'use strict';\n${code}`,
    )

    return async (...args: Parameters<T>) => {
      const result = await fn(...globalValues, ...args)
      return result as ReturnType<T>
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
