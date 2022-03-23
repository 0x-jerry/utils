import { notNullish } from './guard'

describe('guard', () => {
  it('not nullish', () => {
    expect(notNullish(0)).toBe(true)
    expect(notNullish(false)).toBe(true)

    expect(notNullish(undefined)).toBe(false)
    expect(notNullish(null)).toBe(false)
  })
})
