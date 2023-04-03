// @vitest-environment happy-dom
import { isWeb } from './platform'

describe('platform check', () => {
  it('should be in web env', () => {
    expect(isWeb).toBe(true)
  })
})
