import type { Awaitable } from '../types'

export interface UpgradeConfig {
    version: number
    upgrade: <T = unknown, U = unknown>(data: T) => Awaitable<VersionedData<U>>
}

export interface MigrationOption {
    upgrades: UpgradeConfig[]
}

export interface VersionedData<T = unknown> {
    version: number
    data: T
}

export async function migration(data: VersionedData, option: MigrationOption) {
    let result = data;

    for (const upgradeConf of option.upgrades) {
        if (result.version < upgradeConf.version) {
            result = await upgradeConf.upgrade(result)
        }
    }
}