import type { ExtractObjectKeys, ObjectValues } from './object'

describe('utils', () => {
  it('ObjectValues', () => {
    const E = {
      number: 1,
      string: 'string',
      bool: false,
    } as const

    type Values = ObjectValues<typeof E>

    type ExpectedType = 1 | 'string' | false

    expectTypeOf<Values>().toEqualTypeOf<ExpectedType>()
  })

  it('ExtractObjectKeys', () => {
    interface Target {
      a: string
      b: number
      c: boolean
      d: string[]
    }

    type t1 = ExtractObjectKeys<Target, number | string>
    type t2 = ExtractObjectKeys<Target, Iterable<unknown>>
    type t3 = ExtractObjectKeys<Target, Iterable<unknown>, string>

    expectTypeOf<t1>().toEqualTypeOf<'a' | 'b'>()
    expectTypeOf<t2>().toEqualTypeOf<'a' | 'd'>()
    expectTypeOf<t3>().toEqualTypeOf<'d'>()
  })
})
