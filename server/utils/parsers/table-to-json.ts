import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

import type { Root, Code, Parent, Table } from 'mdast'
import { findPrecedingHeading } from '../parsers'

export interface TableOptions {
  headingKey?: string
  indexKey?: string
}

export type TableRowData = Record<string, string>

export const remarkTableTransformer: Plugin<[TableOptions?], Root> = (options = {}) => {
  const headingKey = options.headingKey || 'section'
  const indexKey = options.indexKey || 'index'

  return (tree: Root) => {
    visit(tree, 'table', (node: Table, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return

      const [headerRow, ...dataRows] = node.children
      if (!headerRow) return

      // 1. Context: Preceding heading and Total Rows
      const relatedHeading = findPrecedingHeading(parent, index)
      const totalRows = dataRows.length

      // 2. Process headers
      const headers: string[] = headerRow.children.map(cell => toString(cell).trim())

      // 3. Process data rows
      const jsonContent: TableRowData[] = dataRows.map((row, rowIndex) => {
        const rowData: TableRowData = {}

        // Inject Heading
        if (relatedHeading) {
          rowData[headingKey] = relatedHeading
        }

        // Inject Index (e.g., "item 1 to 50")
        rowData[indexKey] = `item ${rowIndex + 1} de ${totalRows}`

        // Map columns
        row.children.forEach((cell, cellIndex) => {
          const key = headers[cellIndex]
          if (key) {
            rowData[key] = toString(cell).trim()
          }
        })

        return rowData
      })

      // 4. Transform to JSON code block
      const codeNode: Code = {
        type: 'code',
        lang: 'json',
        value: JSON.stringify(jsonContent, null, 2)
      }

      parent.children[index] = codeNode
    })
  }
}
