export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  return (await useDrizzle().select().from(tables.guides)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})
