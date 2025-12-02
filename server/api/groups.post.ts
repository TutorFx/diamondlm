import { PERMISSIONS } from '../../shared/utils/permissions'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { name, slug } = await readBody(event)

  if (!name || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'Name and slug are required' })
  }

  const db = useDrizzle()

  return await db.transaction(async (tx) => {
    const [user] = await tx.select().from(tables.users).where(eq(tables.users.id, session.user?.id || session.id))

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (!user.permissions.includes(PERMISSIONS.USER.GROUP_CREATE)) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const slug = await getAvailableSlug(db, name)

    const [group] = await tx.insert(tables.groups).values({
      name,
      slug
    }).returning()

    if (!group) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create group' })
    }

    await tx.insert(tables.groupMembers).values({
      groupId: group.id,
      userId: session.user?.id || session.id,
      permissions: [
        ...Object.values(PERMISSIONS.GUIDE),
        ...Object.values(PERMISSIONS.GROUP)
      ]
    })

    return group
  })
})
