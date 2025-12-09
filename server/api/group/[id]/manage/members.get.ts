import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = useDrizzle()

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const userId = session.user?.id || session.id

  if (!userId) {
    return createError({
      message: 'Not authenticated',
      statusCode: 401
    })
  }

  const items = await db
    .select({
      id: tables.groupMembers.userId,
      name: tables.users.name,
      permissions: tables.groupMembers.permissions
    })
    .from(tables.groupMembers)
    .innerJoin(tables.groups, eq(tables.groupMembers.groupId, tables.groups.id))
    .innerJoin(tables.users, eq(tables.groupMembers.userId, tables.users.id))
    .where(
      and(
        eq(tables.groupMembers.userId, userId),
        eq(tables.groups.id, id)
      )
    )

  const allPermissions = [
    ...Object.values(PERMISSIONS.GUIDE),
    ...Object.values(PERMISSIONS.GROUP)
  ] as const

  return items.map(item => ({
    id: item.id,
    name: item.name,
    permissions: permissionsToMap(
      allPermissions,
      item.permissions
    )
  })) satisfies GroupPermissions[]
})
