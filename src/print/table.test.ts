import { textTable, textTableToString, uniformTable } from './table.js'

describe('text table', () => {
  it('should format input into a table text', () => {
    const input = [
      ['head1', 'head2'],
      [1234, 'text2'],
      [, false],
      ['tttttttttt1', 'ttttttttttttt3'],
    ]

    const table = textTable(input)
    expect(table).eqls([
      ['head1      ', 'head2         '],
      ['1234       ', 'text2         '],
      ['           ', 'false         '],
      ['tttttttttt1', 'ttttttttttttt3'],
    ])
  })

  it('should return a formatted table string', () => {
    const input = [
      ['head1', 'head2'],
      [1234, 'text2'],
      [, false],
      ['tttttttttt1', 'ttttttttttttt3'],
    ]

    const s = textTableToString(input)

    expect(s).toMatchFileSnapshot('./out/table.txt')
  })

  it('should work with terminal text color and text style', () => {
    const input = [
      ['head1', 'head2'],
      ['\x1B[36m1234\x1B[0m', 'text2'],
    ]

    const s = uniformTable(input)

    expect(s).eqls([
      ['head1', 'head2'],
      ['\x1B[36m1234\x1B[0m ', 'text2'],
    ])

    const str = textTableToString(input)
    expect(str).toMatchFileSnapshot('./out/table-with-style.txt')
  })
})
