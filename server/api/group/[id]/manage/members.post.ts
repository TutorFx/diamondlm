import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = useDrizzle()

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const body = await readValidatedBody(event, z.object({
    email: z.email()
  }).parse)

  const userId = session.user?.id || session.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated'
    })
  }

  const requesterMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(tables.groupMembers.groupId, id),
      eq(tables.groupMembers.userId, userId)
    )
  })

  if (!requesterMembership) {
    throw createError({ statusCode: 403, message: 'Not a member of this group' })
  }

  const allPermissions = [
    ...Object.values(PERMISSIONS.GUIDE),
    ...Object.values(PERMISSIONS.GROUP)
  ] as const

  const canManage = permissionsToMap(
    allPermissions,
    requesterMembership.permissions
  )[PERMISSIONS.GROUP.MANAGE_MEMBERS]

  if (!canManage) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to manage members.'
    })
  }

  const userToAdd = await db.query.users.findFirst({
    where: eq(tables.users.email, body.email)
  })

  if (!userToAdd) {
    throw createError({
      statusCode: 404,
      message: 'User not found with this email.'
    })
  }

  const existingMember = await db.query.groupMembers.findFirst({
    where: and(
      eq(tables.groupMembers.groupId, id),
      eq(tables.groupMembers.userId, userToAdd.id)
    )
  })

  if (existingMember) {
    throw createError({
      statusCode: 409,
      message: 'User is already a member of this group.'
    })
  }

  const [newMember] = await db.insert(tables.groupMembers).values({
    groupId: id,
    userId: userToAdd.id
  }).returning()

  return newMember
})
