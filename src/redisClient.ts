import Redis from 'ioredis'

export { Redis }

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    // Without this, an unset REDIS_URL silently connects to localhost:6379 and
    // the request hangs until the function times out.
    if (!process.env.REDIS_URL) {
      throw new Error(
        'REDIS_URL is not set. Set it to a Redis connection string, or ' +
          'unset CHANNEL_STORE=redis to use in-memory storage instead.',
      )
    }
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
    })
  }
  return redisClient
}
