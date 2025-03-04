import { fs, vol } from 'memfs'
import { readJson, readText } from './fs'

vi.mock('node:fs', () => fs)
vi.mock('node:fs/promises', () => fs.promises)

beforeEach(() => {
  vol.reset()

  vol.fromJSON({
    '/txt': '123',
    '/test.json': JSON.stringify({ a: 1 }),
    '/corrupt.json': '{a: 1}',
  })
})

describe('fs', () => {
  it('read text', async () => {
    const content = await readText('/txt')

    expect(content).toBe('123')
  })

  it('read json', async () => {
    const data = await readJson('/test.json')

    expect(data).toEqual({ a: 1 })
  })

  it('read json with tranform', async () => {
    const data = await readJson('/corrupt.json', {
      transform: (data) => data ?? { a: 2 },
    })

    expect(data).toEqual({ a: 2 })
  })
})
