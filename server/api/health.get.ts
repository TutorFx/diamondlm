import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const drizzle = useDrizzle()
  const redis = useRedis()

  const status = {
    drizzle: 'unknown',
    redis: 'unknown'
  }

  try {
    await drizzle.execute(sql`SELECT 1`)
    status.drizzle = 'ok'
  } catch (error) {
    status.drizzle = 'error'
    console.error('Drizzle health check failed:', error)
  }

  try {
    await redis.ping()
    status.redis = 'ok'
  } catch (error) {
    status.redis = 'error'
    console.error('Redis health check failed:', error)
  }

  if (status.drizzle === 'error' || status.redis === 'error') {
    setResponseStatus(event, 503)
  }

  return status
})
