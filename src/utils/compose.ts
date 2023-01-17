import { Promisable } from '../types'

type Next = () => Promisable<void>

export interface IComposeMiddleware<Ctx = any> {
  (ctx: Ctx, next: Next): Promisable<void>
}

/**
 *
 * compose middleware like `Koa`
 *
 * @param middleware
 * @returns
 */
export function compose<Ctx = any>(middleware: IComposeMiddleware<Ctx>[]) {
  return (context: Ctx, next: Next) =>
    middleware.reduceRight<Next>(
      (next, middleware) => () => middleware(context, next),
      next
    )() as Promise<void>
}
