import { IComposeMiddleware } from '../utils'
import { noop } from './misc'
import { IPlugin, PluginFn, PluginManager } from './PluginManager'

interface PContext {
  a: 2
  b: string
  c: boolean
  d: number[]
}

interface PPlugin<Ctx> extends IPlugin {
  setup?: IComposeMiddleware<Ctx>
  seq?: PluginFn<Ctx>
}

class Test extends PluginManager<PContext, PPlugin<PContext>> {
  ctx: PContext

  constructor() {
    super()

    this.ctx = {
      a: 2,
      b: '',
      c: false,
      d: [],
    }
  }

  setup() {
    return this.runMiddleware('setup', this.ctx, noop)
  }

  seq() {
    return this.run('seq', this.ctx)
  }
}

describe('Plugin Manager', () => {
  it('should sort by priority', () => {
    const t = new Test()
    t.use({
      priority: 1,
    })
    t.use({
      priority: 0,
    })
    t.use({
      priority: 3,
    })
    t.use({
      priority: 2,
    })

    expect(t.sortPlugins().map((n) => n.priority)).eql([0, 1, 2, 3])
  })

  it('should run in order of priority', async () => {
    const t = new Test()
    const s: number[] = []

    t.use({
      priority: 1,
    })

    t.use({
      priority: 0,
      seq() {
        s.push(0)
      },
    })

    t.use({
      priority: 3,
      seq() {
        s.push(3)
      },
    })

    t.use({
      priority: 2,
      seq(ctx) {
        s.push(ctx.a)
      },
    })

    await t.seq()
    expect(s).eql([0, 2, 3])
  })

  it('should run middleware like koa', async () => {
    const t = new Test()

    t.use({
      priority: 1,
      async setup(ctx, next) {
        ctx.d.push(0)
        await next()
        ctx.d.push(0)
      },
    })

    t.use({
      priority: 0,
    })

    t.use({
      priority: 2,
      async setup(ctx, next) {
        ctx.d.push(2)
        await next()
        ctx.d.push(2)
      },
    })

    await t.setup()
    expect(t.ctx.d).eql([0, 2, 2, 0])
  })
})
