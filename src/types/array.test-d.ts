import type { ElementOf } from './array'

describe('array', () => {
  it('#ElementOf', () => {
    expectTypeOf<ElementOf<number[]>>().toBeNumber()

    expectTypeOf<ElementOf<[1, 'string']>>().toEqualTypeOf<1 | 'string'>()

    expectTypeOf<ElementOf<string[]>>().toBeString()
  })
})
