export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = useDrizzle()
  const redis = useRedis()

  const userId = session.user?.id || session.id

  if (!userId) {
    return createError({
      message: 'Not authenticated',
      statusCode: 401
    })
  }

  const last = await redis.get(`user:${userId}:last-group`)

  if (!last) {
    const [firstGroup] = await db
      .select({
        slug: tables.groups.slug
      })
      .from(tables.groupMembers)
      .innerJoin(tables.groups, eq(tables.groupMembers.groupId, tables.groups.id))
      .where(
        and(
          eq(tables.groupMembers.userId, userId),
          sql`${tables.groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.READ}::text)`,
          sql`${tables.groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GROUP.READ}::text)`
        )
      )
      .limit(1)

    if (firstGroup) {
      await redis.set(`user:${userId}:last-group`, firstGroup.slug)

      return {
        slug: firstGroup.slug
      }
    }
  }

  const cachedGroupSlug = await redis.get(`user:${userId}:last-group`)

  if (!cachedGroupSlug) return createError({
    statusCode: 404,
    statusMessage: 'No available group'
  })

  return {
    slug: cachedGroupSlug
  }
})
