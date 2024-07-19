import type { Optional } from '../types/index.js'

export interface TextTableOption {
  highlight?: (cell: string) => string
}

export type TableCellType = Optional<string | number | boolean>

export function textTable(input: TableCellType[][], opt?: TextTableOption) {
  const table = uniformTable(input)

  if (opt?.highlight) {
    for (const row of table) {
      for (const [idx, txt] of row.entries()) {
        row[idx] = opt.highlight(txt)
      }
    }
  }

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

export function uniformTable(table: TableCellType[][]) {
  const colLens = calcColLength(table)

  const uniformed: string[][] = []

  for (const row of table) {
    const uniformedRow: string[] = []

    for (const [idx, s] of row.entries()) {
      uniformedRow[idx] = padEnd(s, colLens[idx], ' ')
    }

    uniformed.push(uniformedRow)
  }

  return uniformed
}

function calcColLength(table: TableCellType[][]) {
  const [header, ...content] = table
  const colLens = []
  for (let idx = 0; idx < header.length; idx++) {
    let maxLen = getLength(header[idx])

    content.forEach((row) => {
      maxLen = Math.max(getLength(row[idx]), maxLen)
    })

    colLens[idx] = maxLen
  }

  return colLens
}

function toString(cell: TableCellType) {
  return (cell ?? '').toString()
}

const StyleRE = /\x1b\[\d+m/g

function getLength(cell: TableCellType) {
  return toString(cell).replace(StyleRE, '').length
}

function padEnd(cell: TableCellType, maxLength: number, fillString = ' '): string {
  const currentLen = getLength(cell)
  const padNumber = maxLength - currentLen

  return padNumber > 0 ? toString(cell) + fillString.repeat(padNumber) : toString(cell)
}
