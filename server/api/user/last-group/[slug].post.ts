import { z } from 'zod/v4'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = useDrizzle()
  const redis = useRedis()

  const userId = session.user?.id || session.id

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  const { slug } = await getValidatedRouterParams(event, z.object({
    slug: z.string()
  }).parse)

  const [firstGroup] = await db
    .select({
      slug: tables.groups.slug
    })
    .from(tables.groupMembers)
    .innerJoin(tables.groups, and(eq(tables.groupMembers.groupId, tables.groups.id)))
    .where(
      and(
        eq(tables.groupMembers.userId, userId),
        eq(tables.groups.slug, slug),
        sql`${tables.groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.READ}::text)`
      )
    )
    .limit(1)
    .catch(() => [])

  const currentSlug = await redis.get(`user:${userId}:last-group`)

  if (currentSlug === slug) {
    return {
      slug
    }
  }

  if (!firstGroup) {
    return createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }

  await redis.set(`user:${userId}:last-group`, firstGroup.slug)

  return {
    slug: firstGroup.slug
  }
})
