import { isNode, isWeb } from './platform'

describe('platform check', () => {
  it('should be in node env', () => {
    expect(isNode).toBe(true)
    expect(isWeb).toBe(false)
  })
})
