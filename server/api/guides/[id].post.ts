import { z } from 'zod/v4'
import { inArray } from 'drizzle-orm'
import { useEmbeddingQueue } from '../../utils/queue'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { content } = await readValidatedBody(event, z.object({
    content: z.string()
  }).parse)

  const db = useDrizzle()

  const [guide] = await db.select({
    title: tables.guides.title
  }).from(tables.guides).where(
    eq(tables.guides.id, Number(id))
  ).limit(1)

  if (!guide) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Guide not found'
    })
  }

  const newChunks = await splitText({ title: guide.title, content })
  const oldChunks = await db.query.chunk.findMany({
    where: eq(tables.chunk.guideId, Number(id))
  })

  const pointers = new Map<number, number>()

  for (let ocIndex = 0; ocIndex < oldChunks.length; ocIndex++) {
    const oldChunk = oldChunks[ocIndex]
    if (!oldChunk) continue
    for (let ncIndex = 0; ncIndex < newChunks.length; ncIndex++) {
      const newChunk = newChunks[ncIndex]
      if (!newChunk) continue

      if (oldChunk.content === newChunk.pageContent) {
        pointers.set(ocIndex, ncIndex)
      }
    }
  }

  const chunksToDelete: number[] = oldChunks
    .filter((_, index) => !pointers.has(index)).map(c => c.id)

  const chunksThatNoExist: number[] = newChunks
    .map((_, index) => index)
    .filter(index => !Array.from(pointers.values()).includes(index))

  const queue = useEmbeddingQueue()

  const updatedGuide = await db.transaction(async (tx) => {
    if (chunksToDelete.length > 0) {
      await tx.delete(tables.chunk).where(inArray(tables.chunk.id, chunksToDelete))
    }

    if (chunksThatNoExist.length > 0) {
      const insertedChunks = await tx.insert(tables.chunk).values(chunksThatNoExist.map((newChunkIndex) => {
        const chunk = newChunks[newChunkIndex]
        if (!chunk) throw new Error('Chunk not found')
        return {
          guideId: Number(id),
          content: chunk.pageContent,
          embedding: null
        }
      })).returning({ id: tables.chunk.id })

      const jobs = insertedChunks.map(chunk => ({
        name: 'generate',
        data: { chunkId: chunk.id },
        opts: {
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 }
        }
      }))

      await queue.addBulk(jobs)
      console.log(`[API] ${jobs.length} chunks enviados para a fila de processamento.`)
    }

    const [updated] = await tx.update(tables.guides).set({
      content
    }).where(
      eq(tables.guides.id, Number(id))
    ).returning()

    return updated
  })

  return updatedGuide
})
