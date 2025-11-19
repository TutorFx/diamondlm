import { z } from 'zod/v4'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { content } = await readValidatedBody(event, z.object({
    content: z.string()
  }).parse)

  const db = useDrizzle()

  const [guide] = await db.select().from(tables.guides).where(
    eq(tables.guides.id, Number(id))
  ).limit(1)

  const chunks = splitText({ title: guide.title, content: content })

  const updatedGuide = await db.update(tables.guides).set({
    content
  }).where(
    and(
      eq(tables.guides.id, Number(id))
    )
  ).returning()

  return updatedGuide
})
