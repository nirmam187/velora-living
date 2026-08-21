/**
 * Small fixed-window rate limiter held in process memory.
 *
 * This is deliberately simple. It is enough to stop a script hammering the enquiry
 * form from one address, which is the realistic threat for a lookbook site. It is
 * NOT a distributed limiter: each serverless instance keeps its own counter, so a
 * determined attacker spread across instances gets more than the nominal budget.
 * If that ever matters, swap the Map for Upstash Redis or Vercel KV — the call
 * signature below is intended to stay the same.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Drop expired buckets so the Map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  /** Seconds until the window resets. Sent back as Retry-After when blocked. */
  retryAfter: number
  remaining: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0, remaining: limit - 1 }
  }

  existing.count += 1
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000)

  if (existing.count > limit) {
    return { ok: false, retryAfter, remaining: 0 }
  }

  return { ok: true, retryAfter, remaining: limit - existing.count }
}

/**
 * Best-effort client IP. Behind Vercel the real address is the first entry of
 * x-forwarded-for; everything else is a fallback for other hosts and local dev.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return (
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  )
}
