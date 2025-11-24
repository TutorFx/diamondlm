export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const guide = await useDrizzle().query.guides.findFirst({
    where: (guide, { eq }) => and(eq(guide.id, Number(id)))
  })

  return guide
})
