import { isCls, isFn } from '../is'

export interface BindConfig {
  singleton?: boolean
}

type MaybeConstructor<T> = (new () => T) | (() => T) | T

interface CtorConfig<T = unknown> {
  ctor: MaybeConstructor<T>

  config?: BindConfig

  /**
   * Singleton instance
   */
  instance?: T

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  targetMap?: WeakMap<any, T>
}

export class Container<CtorMap extends {}> {
  #ctorMap = new Map<keyof CtorMap, CtorConfig>()

  bind<K extends keyof CtorMap>(key: K, ctor: MaybeConstructor<CtorMap[K]>, config?: BindConfig) {
    if (this.#ctorMap.has(key)) {
      throw new Error(`Key ${String(key)} has set!`)
    }

    this.#ctorMap.set(key, { ctor, config })
  }

  get<K extends keyof CtorMap>(key: K, opt?: { target?: unknown }): CtorMap[K] {
    if (!this.#ctorMap.get(key)) {
      throw new Error(`Key ${String(key)} is not binding.`)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const conf = this.#ctorMap.get(key)! as CtorConfig<CtorMap[K]>

    if (conf.config?.singleton) {
      if (!conf.instance) {
        conf.instance = instantiation(conf.ctor)
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return conf.instance!
    }

    if (opt?.target) {
      if (!conf.targetMap) {
        conf.targetMap = new WeakMap()
      }

      if (!conf.targetMap.has(opt.target)) {
        const _instance = instantiation(conf.ctor)
        conf.targetMap.set(opt.target, _instance)
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return conf.targetMap.get(opt.target)!
    }

    return instantiation(conf.ctor)
  }

  /**
   * Only support standard decorator https://github.com/tc39/proposal-decorators#class-fields
   */
  inject<K extends keyof CtorMap>(key: K) {
    type IValueType = CtorMap[K]

    return (_: unknown, _ctx: ClassFieldDecoratorContext<unknown, IValueType>) => {
      return (_initialValue: unknown) => this.get(key)
    }
  }

  /**
   * Only support standard decorator https://github.com/tc39/proposal-decorators#class-fields
   */
  lazyInject<K extends keyof CtorMap>(key: K) {
    type IValueType = CtorMap[K]
    return (_: unknown, ctx: ClassFieldDecoratorContext<unknown, IValueType>) => {
      const DI = this

      ctx.addInitializer(function (this: unknown) {
        Object.defineProperty(this, ctx.name, {
          get() {
            return DI.get(key)
          },
        })
      })
    }
  }

  clear<K extends keyof CtorMap>(key?: K) {
    if (key != null) {
      this.#ctorMap.delete(key)
    } else {
      this.#ctorMap.clear()
    }
  }
}

function instantiation<T>(Ctor: MaybeConstructor<T>): T {
  if (isCls(Ctor)) {
    return new Ctor()
  }

  if (isFn(Ctor)) {
    return Ctor()
  }

  return Ctor
}
