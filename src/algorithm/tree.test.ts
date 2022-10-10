import { walkTree } from './tree'

interface TNode {
  num: number
  s?: string
  children?: TNode[]
  c?: string[]
}

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

describe('tree', () => {
  it('should traverse all tree node in DFS order', () => {
    const nums: number[] = []

    walkTree(rootNode, (o) => {
      nums.push(o.num)
    })

    expect(nums).eql([0, 1, 4, 2])
  })
})
