interface BindConfig {
  singleton?: boolean
}

interface CtorConfig<T = unknown> {
  ctor: new () => T

  config?: BindConfig

  /**
   * Singleton instance
   */
  instance?: T

  targetMap?: WeakMap<{}, T>
}

export class Container<CtorMap extends {}> {
  #ctorMap = new Map<keyof CtorMap, CtorConfig>()

  bind<K extends keyof CtorMap>(key: K, ctor: new () => CtorMap[K], config?: BindConfig) {
    if (this.#ctorMap.has(key)) {
      throw new Error(`Key ${String(key)} has set!`)
    }

    this.#ctorMap.set(key, { ctor, config })
  }

  get<K extends keyof CtorMap>(key: K, opt?: { target?: unknown }): CtorMap[K] {
    if (!this.#ctorMap.get(key)) {
      throw new Error('Key ' + String(key) + ' not binding.')
    }

    const conf = this.#ctorMap.get(key)! as CtorConfig<CtorMap[K]>

    if (conf.config?.singleton) {
      if (!conf.instance) {
        conf.instance = new conf.ctor()
      }

      return conf.instance!
    }

    if (opt?.target) {
      if (!conf.targetMap) {
        conf.targetMap = new WeakMap()
      }

      if (!conf.targetMap.has(opt.target)) {
        const instance = new conf.ctor()
        conf.targetMap.set(opt.target, instance)
      }

      return conf.targetMap.get(opt.target)!
    }

    return new conf.ctor()
  }

  /**
   * Only support standard decorator https://github.com/tc39/proposal-decorators#class-fields
   */
  inject<K extends keyof CtorMap>(key: K) {
    return (_: unknown, _ctx: ClassFieldDecoratorContext): CtorMap[K] => {
      return this.get(key)
    }
  }

  /**
   * Only support standard decorator https://github.com/tc39/proposal-decorators#class-fields
   */
  lazyInject<K extends keyof CtorMap>(key: K) {
    return (_: unknown, ctx: ClassFieldDecoratorContext) => {
      const t = this
      ctx.addInitializer(function (this: unknown) {
        Object.defineProperty(this, ctx.name, {
          get() {
            return t.get(key)
          },
        })
      })
    }
  }
}
