import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

import type { Root, List, Code, Parent } from 'mdast'
import type { GenericRecord, JsonArray } from '../parsers'
import { findPrecedingHeading, hasCodeNode } from '../parsers'

interface ListOptions {
  /** Key for unstructured sub-items (default: "items") */
  defaultListKey?: string
  /** Key for the main item text (default: "name") */
  primaryKey?: string
  /** Key to store the preceding section heading (default: "section") */
  headingKey?: string
}

export const remarkListToJSON: Plugin<[ListOptions?], Root> = (options = {}) => {
  const defaultListKey = options.defaultListKey || 'items'
  const primaryKey = options.primaryKey || 'name'
  const headingKey = options.headingKey || 'section'

  return (tree: Root) => {
    visit(tree, 'list', (node: List, index, parent: Parent | undefined) => {
      // Validate structure
      if (!parent || typeof index !== 'number') return
      if (parent.type === 'listItem') return

      // Guards: skip recursive code blocks or simple lists
      if (hasCodeNode(node)) return

      const hasTrailingColon = node.children.some((child) => {
        const text = toString(child).trim()
        return text.endsWith(':')
      })
      if (hasTrailingColon) return

      // Heuristic: only process "complex" lists (with sub-lists or key-value pairs)
      const hasComplexChildren = node.children.some(child =>
        child.children.some(c => c.type === 'list')
        || toString(child).includes(':')
      )
      if (!hasComplexChildren) return

      // Find the nearest preceding heading to use as context
      const relatedHeading = findPrecedingHeading(parent, index)

      const parsedData: GenericRecord[] = []

      for (const item of node.children) {
        const entity: GenericRecord = {}

        // Inject heading into each item if found
        if (relatedHeading) {
          entity[headingKey] = relatedHeading
        }

        const textNode = item.children.find(c => c.type === 'paragraph')
        const subListNode = item.children.find(c => c.type === 'list') as List | undefined

        // Process main item text and metadata
        if (textNode) {
          const rawText = toString(textNode)
          const metaRegex = /\(([^)]+)\)/g
          let match
          let mainText = rawText

          // Extract metadata in parentheses (e.g. "(type: robust)")
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

        // Process children as properties
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
              // Handle unstructured items
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

      // Replace list node with JSON code block
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
