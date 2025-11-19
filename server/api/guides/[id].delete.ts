export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  const { id } = getRouterParams(event)

  const db = useDrizzle()

  return await db.delete(tables.guides)
    .where(eq(tables.guides.id, Number(id)))
    .returning()
})
