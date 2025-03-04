import { execMigration, type MigrationOption } from './core'

interface V1 {
  version: 1
  a: number
}

interface V2 {
  version: 2
  a: string
}

interface V3 {
  version: 3
  a: string
  b: number
}

describe('migration', () => {
  const config: MigrationOption = {
    upgrades: [
      {
        version: 1,
        upgrade() {
          const d: V1 = {
            version: 1,
            a: 1,
          }

          return d
        },
      },
      {
        version: 2,
        upgrade(data: V1) {
          const d: V2 = {
            version: 2,
            a: data.a.toString(),
          }

          return d
        },
      },
      {
        version: 3,
        upgrade(data: V2) {
          const d: V3 = {
            version: 3,
            a: data.a,
            b: 0,
          }

          return d
        },
      },
    ],
  }

  it('upgrade config', async () => {
    const data = null
    const result = await execMigration(data, config)

    expect(result).toEqual({
      version: 3,
      a: '1',
      b: 0,
    })
  })

  it('upgrade corrupt data', async () => {
    const data = {
      a: false,
    }
    const result = await execMigration(data, config)

    expect(result).toEqual({
      version: 3,
      a: '1',
      b: 0,
    })
  })

  it('upgrade v2 to v3', async () => {
    const data: V2 = {
      version: 2,
      a: '2',
    }

    const result = await execMigration(data, config)

    expect(result).toEqual({
      version: 3,
      a: '2',
      b: 0,
    })
  })
})
