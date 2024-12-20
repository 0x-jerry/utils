import { base64ToJson, jsonToBase64 } from './encoding'

describe('encoding', () => {
  it('should convert json to base64', () => {
    const t = { a: 1 }

    const b = jsonToBase64(t)
    const j = base64ToJson(b)

    expect(j).eql(t)
  })
})
