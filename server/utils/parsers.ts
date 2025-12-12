import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import type { Plugin } from 'unified'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

import type { Root, Table, List, Code, Parent, Node } from 'mdast'

// --- 1. TIPOS SEGUROS ---
type JsonPrimitive = string | number | boolean | null
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]
type JsonValue = JsonPrimitive | JsonObject | JsonArray

type GenericRecord = JsonObject

// --- 2. HELPERS ---

// Verifica recursivamente se existe código (para abortar processamento)
function hasCodeNode(node: Node): boolean {
  if (node.type === 'code') return true
  if ('children' in node && Array.isArray((node as Parent).children)) {
    return (node as Parent).children.some(child => hasCodeNode(child))
  }
  return false
}

/**
 * Procura o Heading (Título) mais próximo antes do nó atual.
 * Percorre o array de siblings de trás para frente a partir do index atual.
 */
function findPrecedingHeading(parent: Parent, startIndex: number): string | null {
  for (let i = startIndex - 1; i >= 0; i--) {
    const node = parent.children[i]
    if (node.type === 'heading') {
      return toString(node).trim()
    }
  }
  return null
}

// --- 3. PLUGIN DE LISTAS ---

interface ListOptions {
  defaultListKey?: string // Onde salvar itens soltos (ex: "items")
  primaryKey?: string // Onde salvar o texto principal do item (ex: "name")
  headingKey?: string // Onde salvar o título da seção (ex: "section")
}

const remarkListToJSON: Plugin<[ListOptions?], Root> = (options = {}) => {
  const defaultListKey = options.defaultListKey || 'items'
  const primaryKey = options.primaryKey || 'name' // Mudei o padrão para 'name' conforme seu exemplo
  const headingKey = options.headingKey || 'section' // Nova chave para o título

  return (tree: Root) => {
    visit(tree, 'list', (node: List, index, parent: Parent | undefined) => {
      // Validações de estrutura
      if (!parent || typeof index !== 'number') return
      if (parent.type === 'listItem') return

      // --- GUARDAS (Proteção) ---
      if (hasCodeNode(node)) return

      const hasTrailingColon = node.children.some((child) => {
        const text = toString(child).trim()
        return text.endsWith(':')
      })
      if (hasTrailingColon) return

      // --- HEURÍSTICA ---
      const hasComplexChildren = node.children.some(child =>
        child.children.some(c => c.type === 'list')
        || toString(child).includes(':')
      )
      if (!hasComplexChildren) return

      // --- CAPTURA DE CONTEXTO (Heading) ---
      // Busca o título vinculado a esta lista
      const relatedHeading = findPrecedingHeading(parent, index)

      // --- PROCESSAMENTO ---
      const parsedData: GenericRecord[] = []

      for (const item of node.children) {
        const entity: GenericRecord = {}

        // Se encontramos um título, injetamos em cada objeto da lista
        if (relatedHeading) {
          entity[headingKey] = relatedHeading
        }

        const textNode = item.children.find(c => c.type === 'paragraph')
        const subListNode = item.children.find(c => c.type === 'list') as List | undefined

        // Processa Item Pai
        if (textNode) {
          const rawText = toString(textNode)
          const metaRegex = /\(([^)]+)\)/g
          let match
          let mainText = rawText

          while ((match = metaRegex.exec(rawText)) !== null) {
            const content = match[1]
            mainText = mainText.replace(match[0], '')
            if (content.includes(':')) {
              const [k, v] = content.split(/:(.*)/s).map(s => s.trim())
              entity[k] = v
            }
          }
          entity[primaryKey] = mainText.replace(/:$/, '').trim()
        }

        // Processa Filhos (Propriedades)
        if (subListNode) {
          subListNode.children.forEach((subItem) => {
            const subText = toString(subItem)
            const propMatch = subText.match(/^([^:]+):\s*(.*)/)

            if (propMatch) {
              const key = propMatch[1].trim()
              const val = propMatch[2].trim()

              if (val.includes(',')) {
                entity[key] = val.split(',').map(s => s.trim())
              } else {
                entity[key] = val
              }
            } else {
              const existingValue = entity[defaultListKey]
              if (Array.isArray(existingValue)) {
                (existingValue as JsonArray).push(subText.trim())
              } else {
                entity[defaultListKey] = [subText.trim()]
              }
            }
          })
        }

        if (Object.keys(entity).length > 0) {
          parsedData.push(entity)
        }
      }

      // Substituição
      if (parsedData.length > 0) {
        const replacementNode: Code = {
          type: 'code',
          lang: 'json',
          value: JSON.stringify(parsedData, null, 2)
        }
        parent.children[index] = replacementNode
      }
    })
  }
}

// ----

type TableRowData = Record<string, string>

interface TableOptions {
  headingKey?: string
  indexKey?: string
}

const remarkTableTransformer: Plugin<[TableOptions?], Root> = (options = {}) => {
  const headingKey = options.headingKey || 'section'
  const indexKey = options.indexKey || 'index'

  return (tree: Root) => {
    visit(tree, 'table', (node: Table, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return

      const [headerRow, ...dataRows] = node.children
      if (!headerRow) return

      // 1. Contexto: Título anterior e Total de Linhas
      const relatedHeading = findPrecedingHeading(parent, index)
      const totalRows = dataRows.length // Total de itens nesta tabela

      // 2. Processa cabeçalhos
      const headers: string[] = headerRow.children.map(cell => toString(cell).trim())

      // 3. Processa dados
      const jsonContent: TableRowData[] = dataRows.map((row, rowIndex) => {
        const rowData: TableRowData = {}

        // Injeta Título
        if (relatedHeading) {
          rowData[headingKey] = relatedHeading
        }

        // Injeta Index (ex: "item 1 de 50")
        // rowIndex começa em 0, então somamos 1
        rowData[indexKey] = `item ${rowIndex + 1} de ${totalRows}`

        // Mapeia colunas
        row.children.forEach((cell, cellIndex) => {
          const key = headers[cellIndex]
          if (key) {
            rowData[key] = toString(cell).trim()
          }
        })

        return rowData
      })

      // 4. Substituição
      const codeNode: Code = {
        type: 'code',
        lang: 'json',
        value: JSON.stringify(jsonContent, null, 2)
      }

      parent.children[index] = codeNode
    })
  }
}

export async function transformMarkdown(input: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkTableTransformer)
    .use(remarkListToJSON, { primaryKey: 'name', defaultListKey: 'items' })
    .use(remarkStringify)

  const file = await processor.process(input)
  return String(file)
}
