import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import type { Plugin } from 'unified'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

import type { Root, Table, List, Code, Parent, Node } from 'mdast'

type JsonPrimitive = string | number | boolean | null
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]
type JsonValue = JsonPrimitive | JsonObject | JsonArray

type GenericRecord = JsonObject

// O nosso GenericRecord agora é um JsonObject estrito
function hasCodeNode(node: Node): boolean {
  if (node.type === 'code') return true

  if ('children' in node && Array.isArray((node as Parent).children)) {
    return (node as Parent).children.some(child => hasCodeNode(child))
  }

  return false
}

// --- 3. PLUGIN DE LISTAS ---

interface ListOptions {
  defaultListKey?: string
  primaryKey?: string
}

const remarkListToJSON: Plugin<[ListOptions?], Root> = (options = {}) => {
  const defaultListKey = options.defaultListKey || 'items'
  const primaryKey = options.primaryKey || 'title'

  return (tree: Root) => {
    visit(tree, 'list', (node: List, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return
      if (parent.type === 'listItem') return // Ignora sub-listas (processa apenas a raiz)

      // --- GUARDA 1: Contém código? ---
      // Verifica recursivamente. Se houver QUALQUER bloco de código dentro desta lista
      // (indentado corretamente), abortamos imediatamente.
      if (hasCodeNode(node)) return

      // --- GUARDA 2: Parece documentação técnica? ---
      // Verifica se os itens terminam com dois pontos isolados (ex: "**tabela:**").
      // Isso indica um cabeçalho de seção, e não um par Chave: Valor.
      // Se a maioria dos itens for assim, ou se encontrarmos esse padrão, evitamos converter.
      const hasTrailingColon = node.children.some((child) => {
        const text = toString(child).trim()
        return text.endsWith(':')
      })

      if (hasTrailingColon) return // ABORTA: Assume que é uma lista de títulos de seção

      // --- HEURÍSTICA DE DADOS ---
      // Só converte se tiver estrutura explicita de dados (sublistas ou par chave:valor com valor preenchido)
      const hasComplexChildren = node.children.some(child =>
        child.children.some(c => c.type === 'list')
        || toString(child).includes(':')
      )

      if (!hasComplexChildren) return

      // --- PROCESSAMENTO ---
      const parsedData: GenericRecord[] = []

      for (const item of node.children) {
        const entity: GenericRecord = {}

        const textNode = item.children.find(c => c.type === 'paragraph')
        const subListNode = item.children.find(c => c.type === 'list') as List | undefined

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
          entity[primaryKey] = mainText.trim()
        }

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

// Tipo para o objeto JSON que criaremos
type TableRowData = Record<string, string>

const remarkTableTransformer: Plugin<[], Root> = () => {
  return (tree: Root) => {
    // Especificamos que queremos visitar nós do tipo 'table'
    // O TypeScript agora sabe que 'node' é do tipo Table
    visit(tree, 'table', (node: Table, index, parent: Parent | undefined) => {
      // Verificação de segurança: precisamos do pai e do índice para substituir o nó
      if (!parent || typeof index !== 'number') return

      // Extrai as linhas da tabela (Table Row)
      const [headerRow, ...dataRows] = node.children

      // Se não houver cabeçalho, não faz nada (evita erro em tabelas vazias)
      if (!headerRow) return

      // Processa os cabeçalhos
      const headers: string[] = headerRow.children.map(cell => toString(cell))

      // Processa os dados
      const jsonContent: TableRowData[] = dataRows.map((row) => {
        const rowData: TableRowData = {}

        row.children.forEach((cell, cellIndex) => {
          // Garante que existe um cabeçalho para esta coluna
          const key = headers[cellIndex]
          if (key) {
            rowData[key] = toString(cell)
          }
        })

        return rowData
      })

      // Cria o novo nó do tipo Code
      const codeNode: Code = {
        type: 'code',
        lang: 'json',
        value: JSON.stringify(jsonContent, null, 2)
      }

      // Substitui o nó 'table' pelo nó 'code' na árvore
      // parent.children é do tipo (Content | PhrasingContent)[],
      // e Code é um Content válido.
      parent.children[index] = codeNode
    })
  }
}

export async function transformMarkdown(input: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkListToJSON, { primaryKey: 'name', defaultListKey: 'items' })
    .use(remarkTableTransformer)
    .use(remarkStringify)

  const file = await processor.process(input)
  return String(file)
}
