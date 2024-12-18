import { filterTreeNodes, findNodeInTree, traverse } from './tree.js'

interface TNode {
  num: number
  children?: TNode[]

  // --- type test
  d?: string
  s?: string
  c?: string[]
  e?: string[]
}

describe('tree#traverse', () => {
  const rootNode: TNode = {
    num: 0,
    children: [
      {
        num: 1,
        children: [
          {
            num: 4,
          },
        ],
      },
      {
        num: 2,
      },
    ],
  }

  it('should traverse all tree node in DFS order', () => {
    const nums: number[] = []

    traverse(rootNode, (o) => {
      nums.push(o.num)
    })

    expect(nums).eql([0, 1, 4, 2])
  })

  it('should traverse all tree node in parent node', () => {
    const nums: number[] = []

    traverse(rootNode, (_, parent) => {
      parent && nums.push(parent.num)
    })

    expect(nums).eql([0, 1, 0])
  })

  it('should stop when callback return true', () => {
    let count = 0
    traverse(rootNode, (node) => {
      count++
      return node.num === 4
    })

    expect(count).eql(3)

    // should not stop
    count = 0
    traverse(rootNode, () => {
      count++
    })

    expect(count).eql(4)
  })
})

describe('tree#findNodeInTree', () => {
  const testNode: TNode = {
    num: 4,
  }

  const rootNode: TNode = {
    num: 0,
    children: [
      {
        num: 1,
        children: [testNode],
      },
      {
        num: 2,
      },
    ],
  }

  it('should find node by num === 4', () => {
    let count = 0
    const findedNode = findNodeInTree(rootNode, (node) => {
      count++
      return node.num === 4
    })

    expect(count).eql(3)
    expect(findedNode).toBe(testNode)
  })

  it('should can not find node by num === -2', () => {
    let count = 0
    const findedNode = findNodeInTree(rootNode, (node) => {
      count++
      return node.num === -2
    })

    expect(count).eql(4)
    expect(findedNode).toBeUndefined()
  })
})

describe('tree#filterTreeNodes', () => {
  const rootNode: TNode = {
    num: 0,
    children: [
      {
        num: 1,
        children: [
          {
            num: 4,
          },
        ],
      },
      {
        num: 2,
        children: [
          {
            num: -1,
          },
        ],
      },
    ],
  }

  it('should filter nodes by num >= 2', () => {
    let count = 0
    const newTree = filterTreeNodes(rootNode, (node) => {
      count++
      return node.num >= 2
    })

    expect(count).eql(5)

    expect(newTree).matchSnapshot()
  })

  it('should filter nodes by num < 0', () => {
    let count = 0
    const newTree = filterTreeNodes(rootNode, (node) => {
      count++
      return node.num < 0
    })

    expect(count).eql(5)

    expect(newTree).matchSnapshot()
  })
  it('should filter nodes by num < -2', () => {
    let count = 0
    const newTree = filterTreeNodes(rootNode, (node) => {
      count++
      return node.num < -2
    })

    expect(count).eql(5)

    expect(newTree.length).toBe(0)
  })
})
