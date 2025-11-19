export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.safeParse)
  const session = await getUserSession(event)

  if (body.success === false) {
    throw createError({
      statusCode: 400
    })
  }

  const db = useDrizzle()

  const [user] = await db.select().from(tables.users).where(eq(tables.users.email, body.data.email)).limit(1)

  if (!user) {
    throw createError({ statusCode: 400 })
  }

  if (!await VerifyPassword(body.data.password, user.password!)) {
    throw createError({ statusCode: 400 })
  }

  await db.update(tables.chats).set({
    userId: user.id
  }).where(eq(tables.chats.userId, session.id))

  await setUserSession(event, {
    user,
    loggedInAt: new Date()
  })

  return null
})
