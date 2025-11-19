import { isNull } from 'drizzle-orm'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[Plugin] Inicializando Worker do BullMQ...')

  const worker = createEmbeddingWorker()

  const db = useDrizzle()
  const queue = useEmbeddingQueue()

  const chunksWithoutEmbedding = await db.select().from(tables.chunk).where(isNull(tables.chunk.embedding))

  if (chunksWithoutEmbedding.length > 0) {
    console.log(`[Plugin] Encontrados ${chunksWithoutEmbedding.length} chunks sem embedding. Adicionando na fila...`)

    const jobs = chunksWithoutEmbedding.map(chunk => ({
      name: 'generate',
      data: { chunkId: chunk.id },
      opts: {
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      }
    }))

    await queue.addBulk(jobs)
  }

  nitroApp.hooks.hook('close', async () => {
    console.log('[Plugin] Fechando Worker do BullMQ...')
    await worker.close()
  })
})
