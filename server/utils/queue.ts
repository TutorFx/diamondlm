import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
})

export const EMBEDDING_QUEUE_NAME = 'embedding-generation'

export function useEmbeddingQueue() {
  return new Queue(EMBEDDING_QUEUE_NAME, { connection })
}

export function createEmbeddingWorker() {
  const worker = new Worker(EMBEDDING_QUEUE_NAME, async (job) => {
    console.log(`[BullMQ] Processando chunk ID: ${job.data.chunkId}`)

    const db = useDrizzle()
    const { generateEmbedding } = useEmbedding()

    const chunkData = await db.query.chunk.findFirst({
      where: eq(tables.chunk.id, job.data.chunkId)
    })

    if (!chunkData) {
      console.warn(`[BullMQ] Chunk ${job.data.chunkId} não encontrado.`)
      return
    }

    const embedding = await generateEmbedding(chunkData.content)

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
