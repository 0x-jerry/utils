import { isIterable } from '../is'
import type { Arrayable } from '../types'

function _traverseTree<T extends {}, Key extends keyof T>(
  nodes: T | Iterable<T>,
  /**
   * @returns return true to stop
   */
  cb: (node: T, parentNode?: T) => boolean | void,
  childrenKey?: Key,
  parent?: T
) {
  const _nodes = isIterable(nodes) ? nodes : [nodes]

  childrenKey ??= 'children' as Key

  for (const node of _nodes) {
    if (cb(node, parent)) {
      return
    }

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
 * @param cb return true to stop
 * @param key default is `'children'`
 */
export function traverse<T extends {}, Key extends keyof T>(
  nodes: Arrayable<T>,
  /**
   * @returns return true to stop
   */
  cb: (node: T, parentNode?: T) => boolean | void,
  key?: Key
) {
  _traverseTree(nodes, cb, key)
}

/**
 * @deprecated use `traverse` instead of.
 */
export const walkTree = traverse

/**
 * @deprecated use `traverse` instead of.
 */
export const traverseTree = traverse
