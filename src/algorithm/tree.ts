import { toArray } from '../core'
import { isIterable } from '../is'
import { Arrayable, ExtractObjectKeys, Optional } from '../types'

/**
 *
 * DFS (Deep-first search)
 *
 * @param node
 * @param cb
 * @param key default is `'children'`
 */
export function traverseTree<
  T extends {},
  Key extends ExtractObjectKeys<T, Optional<Iterable<any>>, Optional<string>>
>(node: Arrayable<T>, cb: (item: T) => void, key?: Key) {
  const nodes = toArray(node)

  key ??= 'children' as Key

  for (const node of nodes) {
    cb(node)
    const children = node[key]

    if (!isIterable(children)) {
      continue
    }

    traverseTree(children as Arrayable<T>, cb, key)
  }
}

/**
 * @deprecated use `traverseTree` insteadof
 */
export const walkTree = traverseTree
