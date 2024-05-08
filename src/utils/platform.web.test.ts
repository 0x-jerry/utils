// @vitest-environment happy-dom
import { isWeb } from './platform.js'

describe('platform check', () => {
  it('should be in web env', () => {
    expect(isWeb).toBe(true)
  })
})
