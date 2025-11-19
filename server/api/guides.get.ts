export default defineEventHandler(async () => {
  return (await useDrizzle().select().from(tables.guides)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})
