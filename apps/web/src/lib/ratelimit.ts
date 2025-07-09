import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Simple in-memory rate limiter for development
class InMemoryRateLimit {
  private requests: Map<string, number[]> = new Map()

  async limit(key: string, limit: number = 5, windowMs: number = 60000) {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove expired requests
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= limit) {
      return {
        success: false,
        reset: Math.max(...validRequests) + windowMs - now
      }
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return {
      success: true,
      reset: windowMs
    }
  }
}

const inMemoryLimiter = new InMemoryRateLimit()

// Create rate limiters with fallback to in-memory for development
function createRateLimiter(limiterConfig: { limiter: any; analytics?: boolean; prefix?: string }, fallbackLimit: number, fallbackWindow: number) {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: limiterConfig.limiter as any,
        analytics: limiterConfig.analytics,
        prefix: limiterConfig.prefix
      })
    }
  } catch (_error) {
    console.warn('Redis not configured, using in-memory rate limiter')
  }
  
  // Fallback to in-memory rate limiter
  return {
    limit: (key: string) => inMemoryLimiter.limit(key, fallbackLimit, fallbackWindow)
  }
}

// Create rate limiters
export const ratelimit = createRateLimiter({
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'sasarjan:ratelimit'
}, 5, 60000)

export const authRatelimit = createRateLimiter({
  limiter: Ratelimit.slidingWindow(3, '300 s'),
  analytics: true,
  prefix: 'sasarjan:auth'
}, 3, 300000)

export const verifyRatelimit = createRateLimiter({
  limiter: Ratelimit.slidingWindow(10, '300 s'),
  analytics: true,
  prefix: 'sasarjan:verify'
}, 10, 300000)