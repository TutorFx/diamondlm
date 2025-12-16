import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { toString } from 'mdast-util-to-string'

import type { Parent, Node } from 'mdast'
import { remarkListToJSON } from './parsers/list-to-json'
import { remarkTableTransformer } from './parsers/table-to-json'

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type GenericRecord = JsonObject

export function hasCodeNode(node: Node): boolean {
  if (node.type === 'code') return true
  if ('children' in node && Array.isArray((node as Parent).children)) {
    return (node as Parent).children.some(child => hasCodeNode(child))
  }
  return false
}

export function findPrecedingHeading(parent: Parent, startIndex: number): string | null {
  for (let i = startIndex - 1; i >= 0; i--) {
    const node = parent.children[i]
    if (node.type === 'heading') {
      return toString(node).trim()
    }
  }
  return null
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
