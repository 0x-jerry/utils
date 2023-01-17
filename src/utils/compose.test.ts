import { compose, IComposeMiddleware } from './compose'

describe('compose', () => {
  const middleware: IComposeMiddleware<{ result: string }>[] = [
    async (ctx, next) => {
      ctx.result += '1'
      await next()
      ctx.result += 'a'
    },
    async (ctx, next) => {
      ctx.result += '2'
      await next()
      ctx.result += 'b'
    },
  ]

  it('should working like dial the onion', async () => {
    const ctx = {
      result: '',
    }

    const next = async () => {
      ctx.result += '3'
    }

    expect(ctx.result).toBe('')

    await compose(middleware)(ctx, next)

    expect(ctx.result).toBe('123ba')
  })
})
