import { isIterable } from '../is'
import { ExtractObjectKeys, Optional } from '../types'

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
>(node: T, cb: (item: T) => void, key?: Key) {
  cb(node)

  key ??= 'children' as Key

  const children = node[key]

  if (!isIterable(children)) {
    return
  }

  for (const item of children as Iterable<any>) {
    walkTree(item as T, cb, key)
  }
}

/**
 * @deprecated use `traverseTree` insteadof
 */
export const walkTree = traverseTree