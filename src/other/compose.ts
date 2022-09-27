type Next = () => Promise<void>

export interface IComposeMiddleware<Ctx> {
  (ctx: Ctx, next: Next): Promise<void>
}

export function compose<Ctx = any>(middleware: IComposeMiddleware<Ctx>[]) {
  return (context: Ctx, next: Next) =>
    middleware.reduceRight<Next>((next, middleware) => () => middleware(context, next), next)()
}
