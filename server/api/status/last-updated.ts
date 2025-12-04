export default defineEventHandler(async () => {
  const db = useDrizzle()

  const [lastUpdated] = await db
    .select({ updatedAt: tables.chunk.updatedAt })
    .from(tables.chunk)
    .orderBy(desc(tables.chunk.updatedAt))
    .limit(1)

  return lastUpdated || { updatedAt: null }
})
