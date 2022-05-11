type Next = () => Promise<void>

interface IComposeMiddleware<Ctx> {
  (ctx: Ctx, next: Next): Promise<void>
}

export function compose<Ctx = any>(middleware: IComposeMiddleware<Ctx>[]) {
  return (context: Ctx, next: Next) => {
    // last called middleware #
    let index = -1

    return dispatch(0)

    function dispatch(i: number): Promise<void> {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))

      index = i

      const fn = i === middleware.length ? next : middleware[i]

      if (!fn) return Promise.resolve()

      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
