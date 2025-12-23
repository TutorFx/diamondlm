import { sql } from 'drizzle-orm'
import { FetchError } from 'ofetch'

export default defineNitroPlugin(async (_nitroApp) => {
  if (import.meta.prerender) return

  const config = useRuntimeConfig()
  const log = logger.withTag('startup')

  // Initialize global status with defaults
  globalThis.__SERVICES_STATUS__ = {
    database: false,
    redis: false,
    ollama: false,
    kokoro: false,
    audio: false
  }

  log.info('Checking services health...')

  const checkDatabase = async () => {
    try {
      await useDrizzle().execute(sql`SELECT 1`)
      log.info('[Database] Connection established.')
      if (globalThis.__SERVICES_STATUS__) {
        globalThis.__SERVICES_STATUS__.database = true
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      log.error('[Database] Connection failed:', message)
    }
  }

  const checkRedis = async () => {
    try {
      await useRedis().ping()
      log.info('[Redis] Connection established.')
      if (globalThis.__SERVICES_STATUS__) {
        globalThis.__SERVICES_STATUS__.redis = true
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      log.error('[Redis] Connection failed:', message)
    }
  }

  const checkOllama = async () => {
    try {
      const ollamaUrl = config.ollama.baseUrl
      const checkUrl = ollamaUrl.endsWith('/api') ? `${ollamaUrl}/tags` : `${ollamaUrl}/api/tags`
      await $fetch(checkUrl, { timeout: 2000 })
      log.info('[Ollama] Service is reachable.')
      if (globalThis.__SERVICES_STATUS__) {
        globalThis.__SERVICES_STATUS__.ollama = true
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      log.warn('[Ollama] Service unreachable:', message)
    }
  }

  const checkKokoro = async () => {
    const kokoroUrl = config.kokoro.apiUrl

    if (!kokoroUrl) {
      log.info('[Kokoro] KOKORO_API_URL not set. Audio feature disabled.')
      return
    }

    try {
      const url = new URL(kokoroUrl)
      const healthUrl = `${url.origin}/health`

      const response = await $fetch<{ status: string }>(healthUrl, {
        timeout: 2000
      }).catch(() => null)

      if (response?.status === 'healthy') {
        log.info('[Kokoro] Service is healthy. Audio feature enabled.')
        if (globalThis.__SERVICES_STATUS__) {
          globalThis.__SERVICES_STATUS__.kokoro = true
          globalThis.__SERVICES_STATUS__.audio = true
        }
      } else {
        log.warn('[Kokoro] Service unhealthy. Disabling audio.')
      }
    } catch (error: unknown) {
      if (error instanceof FetchError) {
        log.error('[Kokoro] Service unreachable. Disabling audio.', error.message)
      }
    }
  }

  await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkOllama(),
    checkKokoro()
  ])
})
