import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = useDrizzle()

  const { id, memberid } = await getValidatedRouterParams(event, z.object({
    id: z.string(),
    memberid: z.string()
  }).parse)

  const userId = session.user?.id || session.id

  if (!userId) {
    return createError({
      message: 'Not authenticated',
      statusCode: 401
    })
  }

  const sessionUser = await getUserGroupPermissions(db, { userId: userId, groupId: id })

  console.log('sessionUser', sessionUser)

  const allowed = sessionUser.permissions[PERMISSIONS.GROUP.MANAGE_MEMBERS]

  if (!allowed) {
    return createError({
      message: 'Forbidden',
      statusCode: 403
    })
  }

  return await getUserGroupPermissions(db, { userId: memberid, groupId: id })
})
