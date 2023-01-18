import { ExtractObjectKeys, Optional, Promisable } from '../types'
import { compose, IComposeMiddleware } from '../utils'
export { IComposeMiddleware } from '../utils'

export interface IPlugin {
  name?: string
  /**
   * Bigger number has the lower priority,
   * only effect {@link PluginFn}
   */
  priority?: number
}

export interface PluginManagerRunOption {
  handleError?: (error: Error) => void
}

export type PluginFn<Ctx = any> = (ctx: Ctx) => Promisable<void>

export class PluginManager<Ctx = {}, P extends IPlugin = IPlugin> {
  plugins = new Set<P>()

  use(plugin: P) {
    this.plugins.add(plugin)
  }

  async run(
    hook: ExtractObjectKeys<P, Optional<PluginFn>>,
    ctx: Ctx,
    opt?: PluginManagerRunOption
  ): Promise<void> {
    const fns: PluginFn[] = this.sortPlugins()
      .map((n) => n[hook] as PluginFn)
      .filter(Boolean)

    const r = Promise.all(
      fns.map(async (fn) => {
        try {
          await fn(ctx)
        } catch (err: any) {
          const _err = err instanceof Error ? err : new Error(err)
          opt?.handleError?.(_err)
        }
      })
    )

    await r
  }

  async runMiddleware(
    hook: ExtractObjectKeys<P, Optional<IComposeMiddleware>, Optional<PluginFn>>,
    ctx: Ctx,
    next: () => Promisable<void>
  ): Promise<void> {
    const middleware = [...this.plugins].map((n) => n[hook] as IComposeMiddleware).filter(Boolean)

    await compose(middleware)(ctx, next)
  }

  sortPlugins() {
    return [...this.plugins].sort((a, b) => (a.priority || 0) - (b.priority || 0))
  }
}
