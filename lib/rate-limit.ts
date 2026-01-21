import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Map en mémoire pour développement (sans Upstash)
class MemoryStore {
  private store = new Map<string, { count: number; reset: number }>()

  async get(key: string) {
    const item = this.store.get(key)
    if (!item) return null
    if (Date.now() > item.reset) {
      this.store.delete(key)
      return null
    }
    return item.count
  }

  async set(key: string, count: number, ttl: number) {
    this.store.set(key, { count, reset: Date.now() + ttl * 1000 })
  }

  async incr(key: string) {
    const item = this.store.get(key)
    if (!item) {
      this.store.set(key, { count: 1, reset: Date.now() + 60000 })
      return 1
    }
    item.count++
    return item.count
  }
}

const memoryStore = new MemoryStore()

// Rate limiter simple (en mémoire)
export async function rateLimit(identifier: string, limit = 10) {
  const key = `rate_limit:${identifier}`
  const count = await memoryStore.incr(key)
  
  if (count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Date.now() + 60000,
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - count,
    reset: Date.now() + 60000,
  }
}

// Rate limiters par type d'endpoint
export const authLimiter = (ip: string) => rateLimit(ip, 5) // 5 req/min pour auth
export const apiLimiter = (ip: string) => rateLimit(ip, 30) // 30 req/min pour API
export const strictLimiter = (ip: string) => rateLimit(ip, 3) // 3 req/min pour actions sensibles
