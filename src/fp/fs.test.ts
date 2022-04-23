import { compose } from './fp'

describe('function program', () => {
  it('should compose two function into one', () => {
    const plusOne = (n: number) => n + 1
    const toString = (n: number) => n.toString()

    const plusOneThenToString = compose(plusOne, toString)

    expect(plusOneThenToString(0)).toBe('1')
    expect(plusOneThenToString.exec(0)).toBe('1')
  })
})
