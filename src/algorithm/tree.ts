import { isIterable } from '../is/index.js'
import type { Arrayable } from '../types/index.js'

interface TraverseCallback<T> {
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  // biome-ignore lint/style/useShorthandFunctionType: <explanation>
  (node: T, parentNode?: T): void | boolean
}

function _traverseTree<T extends {}, Key extends keyof T>(
  nodes: T | Iterable<T>,
  /**
   * @returns return true to stop
   */
  cb: TraverseCallback<T>,
  childrenKey?: Key,
  parent?: T,
) {
  const _nodes = isIterable(nodes) ? nodes : [nodes]

  const _childrenKey = childrenKey ?? ('children' as Key)

  for (const node of _nodes) {
    if (cb(node, parent)) {
      return
    }

    const children = node[_childrenKey]

    if (!isIterable(children)) {
      continue
    }

    _traverseTree(children as T[], cb, _childrenKey, node)
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
  cb: TraverseCallback<T>,
  key?: Key,
) {
  _traverseTree(nodes, cb, key)
}

/**
 * @deprecated use {@link traverse } instead of.
 */
export const walkTree = traverse

/**
 * @deprecated use {@link traverse} instead of.
 */
export const traverseTree = traverse
