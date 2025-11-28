import { z } from 'zod/v4'
import { generateText } from 'ai'
import { useEmbeddingQueue } from '../utils/queue'
import { PERMISSIONS } from '../../shared/utils/permissions'
import { and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  const { content, groupId } = await readValidatedBody(event, z.object({
    content: z.string().min(1),
    groupId: z.uuid().nullish().optional()
  }).parse)

  const db = useDrizzle()

  if (groupId) {
    const [member] = await db.select()
      .from(tables.groupMembers)
      .where(and(
        eq(tables.groupMembers.groupId, groupId),
        eq(tables.groupMembers.userId, session.user.id),
        sql`${tables.groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.CREATE}::text)`
      ))

    if (!member) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to create guides in this group'
      })
    }
  }

  const llm = useOllama()

  const { text: title } = await generateText({
    model: llm('qwen2.5:7b'),
    system: `You are a title generator for a guide:
        - Generate a short title based on the first user's message
        - The title should be less than 30 characters long
        - The title should be a summary of the user's message
        - Do not use quotes (' or ") or colons (:) or any other punctuation
        - Do not use markdown, just plain text`,
    prompt: content.slice(0, 1000)
  })

  const newGuide = await db.transaction(async (tx) => {
    const [guide] = await tx.insert(tables.guides).values({
      title,
      content,
      groupId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    if (!guide) {
      throw createError({
        statusCode: 500,
        message: 'Failed to create guide'
      })
    }

    const chunks = await splitText({ title, content })

    if (chunks.length > 0) {
      const insertedChunks = await tx.insert(tables.chunk).values(chunks.map(chunk => ({
        guideId: guide.id,
        content: chunk.pageContent,
        embedding: null
      }))).returning({ id: tables.chunk.id })

      const queue = useEmbeddingQueue()

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

    return guide
  })

  return newGuide
})
