import IORedis from 'ioredis'

let redis: null | IORedis

export function useRedis() {
  const {
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD
  } = process.env

  if (!redis) {
    redis = new IORedis({
      host: REDIS_HOST || 'localhost',
      port: Number(REDIS_PORT) || 6379,
      password: REDIS_PASSWORD,
      maxRetriesPerRequest: null
    })
  }
  return redis
}
