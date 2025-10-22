import { index, pgTable, serial, text, vector } from 'drizzle-orm/pg-core'

export const guides = pgTable(
  'guides',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    embedding: vector('embedding', { dimensions: 1024 })
  },
  table => [
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops'))
  ]
)
