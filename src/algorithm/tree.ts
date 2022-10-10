import { is } from '../is'
import { ExtractObjectKeys, Optional } from '../types'

/**
 *
 * DFS (Deep-first search)
 *
 * @param node
 * @param cb
 * @param key default is `'children'`
 */
export function walkTree<
  T extends {},
  Key extends ExtractObjectKeys<T, Optional<Iterable<any>>, Optional<string>>
>(node: T, cb: (item: T) => void, key?: Key) {
  cb(node)

  key ??= 'children' as Key

  const children = node[key]

  if (!is.iterable(children)) {
    return
  }

  for (const item of children) {
    walkTree(item as T, cb, key)
  }
}
