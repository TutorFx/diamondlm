import { isNull } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return (await useDrizzle().select().from(tables.guides).where(isNull(tables.guides.groupId))).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})
