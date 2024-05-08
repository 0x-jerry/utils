import { isNode, isWeb } from './platform.js'

describe('platform check', () => {
  it('should be in node env', () => {
    expect(isNode).toBe(true)
    expect(isWeb).toBe(false)
  })
})
