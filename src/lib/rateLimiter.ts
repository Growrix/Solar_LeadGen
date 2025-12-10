/**
 * Rate Limiter for authentication endpoints
 * 
 * Development: In-memory Map (resets on server restart)
 * Production: Ready for Upstash Redis when configured
 * 
 * Rate limit: 5 requests per 15 minutes per identifier (email/IP)
 * as per research.md decisions
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for development
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const MAX_REQUESTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (email or IP address)
 * @returns Object with { allowed: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(identifier: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  // Clean up expired entry or create new one
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + WINDOW_MS,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for an identifier (useful for testing)
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  const key = `ratelimit:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clean up expired entries (call periodically to prevent memory leak)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// TODO: Production Redis implementation
// When UPSTASH_REDIS_REST_URL is configured, use Redis instead of in-memory store
// import { Redis } from '@upstash/redis';
// const redis = process.env.UPSTASH_REDIS_REST_URL
//   ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
//   : null;
