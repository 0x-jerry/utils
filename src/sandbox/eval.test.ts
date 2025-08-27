import { createSaferEval } from './eval'

describe('eval', () => {
  it('should support parameters', async () => {
    const saferEval = createSaferEval()

    const ctx = { a: 0 }
    await saferEval('$', '$.a = 1')(ctx)

    expect(ctx.a).toBe(1)
  })

  it('should disabled almost all global objects', async () => {
    const saferEval = createSaferEval()

    const ctx = { fetch: 0 }
    await saferEval('$', '$.fetch = fetch')(ctx)

    expect(ctx.fetch).toBe(undefined)
  })

  it('should have a very small set of global objects', async () => {
    const saferEval = createSaferEval()

    // biome-ignore lint/suspicious/noExplicitAny: for test
    const ctx: any = { x: null }
    await saferEval('$', '$.x = globalThis')(ctx)

    expect(ctx.x.global).toBe(ctx.x)
    expect(ctx.x.window).toBe(ctx.x)

    expect(Object.keys(ctx.x).sort()).toEqual([
      'Array',
      'BigInt',
      'Blob',
      'Boolean',
      'Date',
      'Infinity',
      'Map',
      'NaN',
      'Number',
      'RegExp',
      'Set',
      'String',
      'console',
      'global',
      'globalThis',
      'window',
    ])
  })

  it('should support configure with global objects', async () => {
    const saferEval = createSaferEval({
      allowedGlobalKeys: ['fetch'],
    })

    const ctx = { fetch: null }
    await saferEval('$', '$.fetch = fetch')(ctx)

    expect(ctx.fetch).toBe(globalThis.fetch)
  })

  it('should support extends global object', async () => {
    const msgs: string[] = []

    const saferEval = createSaferEval({
      allowedGlobalKeys: ['fetch'],
      globals: {
        console: {
          log(...args: string[]) {
            msgs.push(...args)
          },
        },
      },
    })

    await saferEval("console.log('hello', 'world')")()

    expect(msgs).toEqual(['hello', 'world'])
  })

  it('should support return value', async () => {
    const saferEval = createSaferEval()

    type EvalType = () => string

    const r = await saferEval<EvalType>('return `hello`')()

    expect(r).toEqual('hello')
  })
})
