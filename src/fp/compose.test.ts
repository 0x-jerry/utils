import { compose } from './compose.js'

describe('function program', () => {
  const plusOne = (n: number) => n + 1
  const toString = (n: number) => n.toString()

  it('should compose two function into one', () => {
    const plusOneThenToString = compose(plusOne, toString)

    expect(plusOneThenToString(0)).toBe('1')
    expect(plusOneThenToString.exec(0)).toBe('1')
  })
})
