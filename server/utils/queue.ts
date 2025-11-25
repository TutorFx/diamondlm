import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { useDrizzle, tables, eq } from './drizzle'
import { useEmbedding } from './embedding'

let redis: null | IORedis

export function useRedis() {
  if (!redis) {
    redis = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null
    })
  }
  return redis
}

export const EMBEDDING_QUEUE_NAME = 'embedding-generation'

export function useEmbeddingQueue() {
  const connection = useRedis()
  return new Queue(EMBEDDING_QUEUE_NAME, { connection })
}

export function createEmbeddingWorker() {
  const connection = useRedis()
  const worker = new Worker(EMBEDDING_QUEUE_NAME, async (job) => {
    console.log(`[BullMQ] Processando chunk ID: ${job.data.chunkId}`)

    const db = useDrizzle()
    const { generateEmbedding } = useEmbedding()

    const [chunkData] = await db
      .select({
        content: tables.chunk.content,
        guideTitle: tables.guides.title
      })
      .from(tables.chunk)
      .leftJoin(tables.guides, eq(tables.chunk.guideId, tables.guides.id))
      .where(eq(tables.chunk.id, job.data.chunkId))

    if (!chunkData) {
      console.warn(`[BullMQ] Chunk ${job.data.chunkId} não encontrado.`)
      return
    }

    const contentToEmbed = chunkData.guideTitle
      ? `${chunkData.guideTitle}: ${chunkData.content}`
      : chunkData.content

    const embedding = await generateEmbedding(contentToEmbed)

    await db.update(tables.chunk)
      .set({
        embedding: embedding,
        updatedAt: new Date()
      })
      .where(eq(tables.chunk.id, job.data.chunkId))

    console.log(`[BullMQ] Chunk ${job.data.chunkId} finalizado.`)
    return { success: true }
  }, {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000
    }
  })

  return worker
}
