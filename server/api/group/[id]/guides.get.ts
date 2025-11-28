import { eq, desc, and } from 'drizzle-orm'
import { useDrizzle, tables } from '../../../utils/drizzle'
import { PERMISSIONS } from '../../../../shared/utils/permissions'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Missing id'
    })
  }
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const [member] = await useDrizzle()
    .select()
    .from(tables.groupMembers)
    .where(
      and(
        eq(tables.groupMembers.groupId, id),
        eq(tables.groupMembers.userId, session.user.id)
      )
    )

  if (!member || !member.permissions.includes(PERMISSIONS.GUIDE.READ)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden'
    })
  }

  return await useDrizzle()
    .select()
    .from(tables.guides)
    .where(eq(tables.guides.groupId, id))
    .orderBy(desc(tables.guides.createdAt))
})
