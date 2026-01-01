/**
 * Rate Limiting Utilities
 *
 * Provides in-memory rate limiting to prevent brute force attacks and API abuse.
 * For production with multiple servers, use Redis-based rate limiting (@upstash/ratelimit).
 *
 * Features:
 * - Sliding window rate limiting
 * - Per-IP and per-user rate limiting
 * - Configurable windows and limits
 * - Automatic cleanup of old entries
 *
 * OWASP Coverage:
 * - A07:2021 – Identification and Authentication Failures (brute force prevention)
 * - A04:2021 – Insecure Design (rate limiting as security control)
 *
 * Production Upgrade Path:
 * Replace with @upstash/ratelimit for distributed rate limiting:
 *
 * ```typescript
 * import { Ratelimit } from "@upstash/ratelimit"
 * import { Redis } from "@upstash/redis"
 *
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "10 m"),
 * })
 * ```
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * In-memory store for rate limiting
 * NOTE: This is not suitable for production with multiple servers
 * Use Redis or similar distributed cache in production
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry>
  private cleanupInterval: NodeJS.Timeout | null

  constructor() {
    this.store = new Map()
    this.cleanupInterval = null
    this.startCleanup()
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key)
        }
      }
    }, 60000)

    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Get rate limit entry
   */
  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key)
  }

  /**
   * Set rate limit entry
   */
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry)
  }

  /**
   * Delete rate limit entry
   */
  delete(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Stop cleanup interval (for testing)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Global store instance
const globalStore = new RateLimitStore()

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number

  /**
   * Time window in milliseconds
   */
  windowMs: number

  /**
   * Optional key prefix for namespacing
   */
  prefix?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean

  /**
   * Number of requests remaining in current window
   */
  remaining: number

  /**
   * Total limit for this window
   */
  limit: number

  /**
   * Timestamp when the window resets
   */
  resetAt: number

  /**
   * Time until reset in milliseconds
   */
  resetIn: number
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private config: Required<RateLimiterConfig>
  private store: RateLimitStore

  constructor(config: RateLimiterConfig, store?: RateLimitStore) {
    this.config = {
      limit: config.limit,
      windowMs: config.windowMs,
      prefix: config.prefix || 'ratelimit',
    }
    this.store = store || globalStore
  }

  /**
   * Check if request is allowed and update count
   *
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns Rate limit result
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.prefix}:${identifier}`
    const now = Date.now()

    const entry = this.store.get(key)

    // No entry or expired - create new window
    if (!entry || entry.resetAt < now) {
      const resetAt = now + this.config.windowMs
      this.store.set(key, {
        count: 1,
        resetAt,
      })

      return {
        success: true,
        remaining: this.config.limit - 1,
        limit: this.config.limit,
        resetAt,
        resetIn: this.config.windowMs,
      }
    }

    // Entry exists and is valid
    const newCount = entry.count + 1

    // Check if limit exceeded
    if (newCount > this.config.limit) {
      return {
        success: false,
        remaining: 0,
        limit: this.config.limit,
        resetAt: entry.resetAt,
        resetIn: entry.resetAt - now,
      }
    }

    // Update count
    this.store.set(key, {
      count: newCount,
      resetAt: entry.resetAt,
    })

    return {
      success: true,
      remaining: this.config.limit - newCount,
      limit: this.config.limit,
      resetAt: entry.resetAt,
      resetIn: entry.resetAt - now,
    }
  }

  /**
   * Reset rate limit for an identifier
   *
   * @param identifier - Unique identifier to reset
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.config.prefix}:${identifier}`
    this.store.delete(key)
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Login rate limiter: 5 attempts per 10 minutes per IP
 * Prevents brute force password attacks
 */
export const loginRateLimiter = new RateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
  prefix: 'login',
})

/**
 * API rate limiter: 100 requests per minute per user
 * Prevents API abuse
 */
export const apiRateLimiter = new RateLimiter({
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  prefix: 'api',
})

/**
 * Request creation rate limiter: 10 requests per hour per user
 * Prevents spam event request creation
 */
export const requestCreationRateLimiter = new RateLimiter({
  limit: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'create-request',
})

/**
 * Password reset rate limiter: 3 attempts per hour per IP
 * Prevents password reset abuse
 */
export const passwordResetRateLimiter = new RateLimiter({
  limit: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'password-reset',
})

/**
 * Get IP address from request headers
 *
 * @param request - Request object (Next.js or standard Request)
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
  const headers = request.headers

  // Try various headers that might contain the IP
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Rate limit middleware helper for API routes
 *
 * @param limiter - Rate limiter to use
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @returns Response if rate limited, null if allowed
 */
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string
): Promise<Response | null> {
  const result = await limiter.check(identifier)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(result.resetIn / 1000), // seconds
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
        },
      }
    )
  }

  return null
}

/**
 * Example usage in API route:
 *
 * ```typescript
 * import { loginRateLimiter, getClientIp, checkRateLimit } from '@/lib/security/rate-limit'
 *
 * export async function POST(request: Request) {
 *   const ip = getClientIp(request)
 *
 *   // Check rate limit
 *   const rateLimitResponse = await checkRateLimit(loginRateLimiter, ip)
 *   if (rateLimitResponse) {
 *     return rateLimitResponse
 *   }
 *
 *   // Continue with login logic...
 * }
 * ```
 */

/**
 * Custom rate limiter factory
 *
 * @param limit - Maximum requests
 * @param windowMs - Time window in milliseconds
 * @param prefix - Optional prefix for keys
 * @returns Configured RateLimiter instance
 */
export function createRateLimiter(
  limit: number,
  windowMs: number,
  prefix?: string
): RateLimiter {
  return new RateLimiter({ limit, windowMs, prefix })
}

/**
 * Helper to convert time strings to milliseconds
 *
 * @param time - Time string (e.g., "10m", "1h", "30s")
 * @returns Milliseconds
 */
export function parseTimeWindow(time: string): number {
  const units: Record<string, number> = {
    s: 1000,           // seconds
    m: 60 * 1000,      // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  }

  const match = time.match(/^(\d+)([smhd])$/)
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Use format like "10m", "1h", "30s"`)
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  return value * units[unit]
}
