import type { ICompose } from './types'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const compose: ICompose = (() => {}) as any

describe('compose type check', () => {
  it('expect error at type check', () => {
    // @ts-expect-error
    compose(Number.parseInt, (x: string) => x)
    compose(Number.parseInt, String)
  })
})
