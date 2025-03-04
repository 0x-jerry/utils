import { isNumber, isObject } from '../is'
import type { Awaitable, Optional } from '../types'

export interface UpgradeConfig {
  version: number
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  upgrade: (data: any) => Awaitable<VersionedData>
}

export interface MigrationOption {
  upgrades: UpgradeConfig[]
}

export interface VersionedData {
  version: number
}

export async function execMigration(data: Optional<unknown>, option: MigrationOption) {
  let result = data

  for (const upgradeConf of option.upgrades) {
    const version =
      isObject(result) && 'version' in result && isNumber(result.version) && result.version

    if (version === false || version < upgradeConf.version) {
      result = await upgradeConf.upgrade(result)
    }
  }

  return result
}
