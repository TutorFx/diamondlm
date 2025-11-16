import type { User } from '#auth-utils'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.safeParse)
  const session = await getUserSession(event)

  if (body.success === false) {
    throw createError({
      statusCode: 400
    })
  }

  const hash = await HashPassword(body.data.password)

  const db = useDrizzle()

  const [user] = await db.insert(tables.users).values({
    email: body.data.email,
    name: body.data.name,
    password: hash,
    provider: 'token',
    providerId: null
  }).returning()

  if (!user) {
    throw createError({ statusCode: 400 })
  } else {
    await db.update(tables.chats).set({
      userId: user.id
    }).where(eq(tables.chats.userId, session.id))
  }

  await setUserSession(event, {
    user: {
      name: user.name,
      email: user.email,
      id: user.id,
      avatar: user.avatar,
      provider: 'token',
      providerId: null
    } satisfies User,
    loggedInAt: new Date()
  })

  return null
})
