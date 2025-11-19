export default defineNitroPlugin((nitroApp) => {
  // Apenas inicia o worker se não estivermos rodando em modo build/prerender
  // O worker ficará vivo processando jobs em background
  console.log('[Plugin] Inicializando Worker do BullMQ...')

  const worker = createEmbeddingWorker()

  // Opcional: Lidar com fechamento gracioso
  nitroApp.hooks.hook('close', async () => {
    console.log('[Plugin] Fechando Worker do BullMQ...')
    await worker.close()
  })
})
