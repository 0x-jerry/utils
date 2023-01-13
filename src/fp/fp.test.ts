import { compose, input } from './fp'

describe('function program', () => {
  const plusOne = (n: number) => n + 1
  const toString = (n: number) => n.toString()

  it('should compose two function into one', () => {
    const plusOneThenToString = compose(plusOne, toString)

    expect(plusOneThenToString(0)).toBe('1')
    expect(plusOneThenToString.exec(0)).toBe('1')
  })

  it('use pipe style', () => {
    const x = input(0).pipe(plusOne).pipe(toString).exec()

    expect(x).toBe('1')
  })
})
