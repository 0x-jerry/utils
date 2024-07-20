import type { ICompose } from './types.js'

const compose: ICompose = (() => {}) as any

describe('compose type check', () => {
  it('expect error at type check', () => {
    // @ts-expect-error
    compose(parseInt, (x: string) => x)
    compose(parseInt, String)
  })
})
