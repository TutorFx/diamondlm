export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = useDrizzle()

  const userId = session.user?.id || session.id

  if (!userId) {
    return createError({
      message: 'Not authenticated',
      statusCode: 401
    })
  }

  return await db
    .select({
      id: tables.groups.id,
      name: tables.groups.name,
      slug: tables.groups.slug,
      createdAt: tables.groups.createdAt,
      permissions: tables.groupMembers.permissions
    })
    .from(tables.groupMembers)
    .innerJoin(tables.groups, eq(tables.groupMembers.groupId, tables.groups.id))
    .where(eq(tables.groupMembers.userId, userId))
})
