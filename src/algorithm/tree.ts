import { ensureArray } from '../core'
import { isIterable } from '../is'
import type { Arrayable } from '../types'

// biome-ignore lint/suspicious/noConfusingVoidType: on purpose
type TreeVisitCallback<T> = (node: T, parentNode?: T) => void | boolean

function _traverseTree<T extends {}, Key extends keyof T>(
  nodes: T | Iterable<T>,
  /**
   * @returns return true to stop
   */
  cb: TreeVisitCallback<T>,
  childrenKey: Key,
  parent?: T,
): boolean {
  const _nodes = isIterable(nodes) ? nodes : [nodes]

  for (const node of _nodes) {
    if (cb(node, parent)) {
      return true
    }

    const children = node[childrenKey]

    if (!isIterable(children)) {
      continue
    }

    if (_traverseTree(children as T[], cb, childrenKey, node)) {
      return true
    }
  }

  return false
}

/**
 *
 * DFS (Deep-first search)
 *
 * @param nodes
 * @param cb return true to stop
 * @param childrenKey default is `'children'`
 */
export function traverse<T extends {}, Key extends keyof T>(
  nodes: Arrayable<T>,
  /**
   * @returns return true to stop
   */
  cb: TreeVisitCallback<T>,
  childrenKey?: Key,
) {
  const _childrenKey = childrenKey ?? ('children' as Key)

  _traverseTree(nodes, cb, _childrenKey)
}

/**
 *
 * @param childrenKey default is `'children'`
 */
export function findNodeInTree<T extends {}, Key extends keyof T>(
  nodes: Arrayable<T>,
  predicate: TreeVisitCallback<T>,
  childrenKey?: Key,
) {
  let resultNode: T | undefined

  const _childrenKey = childrenKey ?? ('children' as Key)

  _traverseTree(
    nodes,
    (node, parentNode) => {
      if (predicate(node, parentNode)) {
        resultNode = node
        return true
      }
    },
    _childrenKey,
  )

  return resultNode
}

function _filterTreeNodes<T extends {}, Key extends keyof T>(
  nodes: Arrayable<T>,
  /**
   * @returns return true to stop
   */
  predicate: TreeVisitCallback<T>,
  childrenKey: Key,
  parent?: T,
): T[] {
  const nodesArr = ensureArray(nodes)

  const newTree: T[] = []

  for (const node of nodesArr) {
    const _node = { ...node }

    const children = _filterTreeNodes(_node[childrenKey] as T[], predicate, childrenKey, _node)

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    _node[childrenKey] = children as any

    const shouldInclude = predicate(_node, parent)

    if (shouldInclude || (_node[childrenKey] as T[]).length) {
      newTree.push(_node)
    }
  }

  return newTree
}

export function filterTreeNodes<T extends {}, Key extends keyof T>(
  nodes: Arrayable<T>,
  predicate: TreeVisitCallback<T>,
  childrenKey?: Key,
): T[] {
  const _childrenKey = childrenKey ?? ('children' as Key)

  return _filterTreeNodes(nodes, predicate, _childrenKey)
}
