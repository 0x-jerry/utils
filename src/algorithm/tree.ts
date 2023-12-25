import { isIterable } from '../is'
import { Arrayable } from '../types'

export function _traverseTree<T extends {}, Key extends keyof T>(
  nodes: T | Iterable<T>,
  cb: (node: T, parentNode?: T) => void,
  childrenKey?: Key,
  parent?: T
) {
  const _nodes = isIterable(nodes) ? nodes : [nodes]

  childrenKey ??= 'children' as Key

  for (const node of _nodes) {
    cb(node, parent)
    const children = node[childrenKey]

    if (!isIterable(children)) {
      continue
    }

    _traverseTree(children as T[], cb, childrenKey, node)
  }
}

/**
 *
 * DFS (Deep-first search)
 *
 * @param nodes
 * @param cb
 * @param key default is `'children'`
 */
export function traverseTree<T extends {}, Key extends keyof T>(
  nodes: Arrayable<T>,
  cb: (node: T, parentNode?: T) => void,
  key?: Key
) {
  _traverseTree(nodes, cb, key)
}

/**
 * @deprecated use `traverseTree` insteadof
 */
export const walkTree = traverseTree
