import { useEmbedding } from '../utils/embedding'

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)
  const session = await getUserSession(event)

  if (!q) {
    return {
      message: 'Please provide a query parameter "q"'
    }
  }

  const embed = useEmbedding()
  const results = await embed.findSimilarGuides(q as string, session.user?.id || null)

  return {
    query: q,
    results
  }
})
