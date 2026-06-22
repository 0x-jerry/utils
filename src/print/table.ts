import type { Optional } from '../types'

export interface TextTableOption {
  /**
   * @default "-"
   */
  headLine?: string
  highlight?: (cell: TableCellType) => string
}

export type TableCellType = Optional<string | number | boolean>

export function textTable(input: TableCellType[][], opt?: TextTableOption) {
  const table = uniformTable(input, opt)

  return table
}

export interface TextTableToStringOption extends TextTableOption {}

export function textTableToString(input: TableCellType[][], opt?: TextTableToStringOption) {
  const table = textTable(input, opt)

  const str: string[] = []

  for (const row of table) {
    str.push(row.join(' '))
  }

  return str.join('\n')
}

export function uniformTable(table: TableCellType[][], opt?: TextTableOption) {
  const { headLine = '-', highlight } = opt || {}

  const colLens = calcColLength(table)

  const uniformed: string[][] = []

  for (const [rowIdx, row] of table.entries()) {
    const uniformedRow: string[] = []

    for (const [idx, s] of row.entries()) {
      const str = highlight ? highlight(s) : s
      uniformedRow[idx] = padEnd(str, colLens[idx] || 0, ' ')
    }

    uniformed.push(uniformedRow)

    if (rowIdx === 0 && headLine) {
      const headLineRow: string[] = []
      for (const [idx] of row.entries()) {
        headLineRow[idx] = padEnd('', colLens[idx] || 0, headLine)
      }
      uniformed.push(headLineRow)
    }
  }

  return uniformed
}

function calcColLength(table: TableCellType[][]) {
  const [header = [], ...content] = table
  const colLens = []
  for (let idx = 0; idx < header.length; idx++) {
    let maxLen = getLength(header[idx])

    for (const row of content) {
      maxLen = Math.max(getLength(row[idx]), maxLen)
    }

    colLens[idx] = maxLen
  }

  return colLens
}

function _toString(cell: TableCellType) {
  return (cell ?? '').toString()
}

const StyleRE = /\u001b\[[0-9;]*m/g

function getLength(cell: TableCellType) {
  return _toString(cell).replace(StyleRE, '').length
}

function padEnd(cell: TableCellType, maxLength: number, fillString = ' '): string {
  const currentLen = getLength(cell)
  const padNumber = maxLength - currentLen

  return padNumber > 0 ? _toString(cell) + fillString.repeat(padNumber) : _toString(cell)
}
