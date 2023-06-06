import { textTable, textTableToString } from './table'

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

  it('should return a formated table string', () => {
    const input = [
      ['head1', 'head2'],
      [1234, 'text2'],
      [, false],
      ['tttttttttt1', 'ttttttttttttt3'],
    ]

    const s = textTableToString(input)

    expect(s).toMatchFileSnapshot('./out/table.txt')
  })
})
