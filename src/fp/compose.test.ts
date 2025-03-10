import { compose } from './compose'

describe('function program', () => {
  const plusOne = (n: number) => n + 1
  const _toString = (n: number) => n.toString()

  it('should compose two function into one', () => {
    const plusOneThenToString = compose(plusOne, _toString)

    expect(plusOneThenToString(0)).toBe('1')
    expect(plusOneThenToString.exec(0)).toBe('1')
  })
})
