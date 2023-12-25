import { traverseTree } from './tree'

interface TNode {
  num: number
  children?: TNode[]

  // --- type test
  d: string
  s?: string
  c?: string[]
  e: string[]
}

const rootNode = {
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
} as TNode

describe('tree', () => {
  it('should traverse all tree node in DFS order', () => {
    const nums: number[] = []

    traverseTree(rootNode, (o) => {
      nums.push(o.num)
    })

    expect(nums).eql([0, 1, 4, 2])
  })

  it('should traverse all tree node in parent node', () => {
    const nums: number[] = []

    traverseTree(rootNode, (_, parent) => {
      parent && nums.push(parent.num)
    })

    expect(nums).eql([0, 1, 0])
  })
})
