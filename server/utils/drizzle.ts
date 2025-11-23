import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../../server/database/schema'

export { sql, eq, and, or, desc } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOSTNAME,
    POSTGRES_PORT,
    POSTGRES_DB
  } = process.env
  return drizzle({
    connection: {
      connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOSTNAME}:${POSTGRES_PORT}/${POSTGRES_DB}`
    },
    schema
  })
}

export type Guide = typeof tables.guides.$inferSelect
export type NewGuide = typeof tables.guides.$inferInsert
export type Chunk = typeof tables.chunk.$inferSelect
export type NewChunk = typeof tables.chunk.$inferInsert
export type User = typeof tables.users.$inferSelect
export type NewUser = typeof tables.users.$inferInsert
export type AuthProvider = typeof tables.providerEnum.enumValues[number]
export type Group = typeof tables.groups.$inferSelect
export type NewGroup = typeof tables.groups.$inferInsert
export type GroupMember = typeof tables.groupMembers.$inferSelect
export type NewGroupMember = typeof tables.groupMembers.$inferInsert
