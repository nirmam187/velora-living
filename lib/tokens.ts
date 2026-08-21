import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * HMAC helpers for the two places this site needs a tamper-proof string:
 * one-click unsubscribe links, and the admin session cookie.
 *
 * The secret comes from AUTH_SECRET. In development a fixed fallback is used so
 * the app runs with no configuration; in production a missing secret is fatal
 * rather than silently insecure.
 */

function secret(): string {
  const value = process.env.AUTH_SECRET
  if (value && value.length >= 16) return value

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'AUTH_SECRET must be set to at least 16 characters in production. Generate one with: openssl rand -base64 32',
    )
  }
  return 'dev-only-insecure-secret-do-not-ship'
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

/** Constant-time compare that tolerates length mismatch without throwing. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function unsubscribeToken(email: string): string {
  return sign(`unsubscribe:${email.toLowerCase()}`)
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  return safeEqual(unsubscribeToken(email), token)
}

/**
 * Admin session value: `issuedAtMs.signature`. Stateless, so there is no session
 * store to keep — the cookie is self-validating and expires on its own.
 */
export function createAdminSession(): string {
  const issued = Date.now().toString()
  return `${issued}.${sign(`admin:${issued}`)}`
}

export function verifyAdminSession(value: string | undefined, maxAgeMs: number): boolean {
  if (!value) return false
  const [issued, signature] = value.split('.')
  if (!issued || !signature) return false
  if (!safeEqual(sign(`admin:${issued}`), signature)) return false

  const age = Date.now() - Number(issued)
  return Number.isFinite(age) && age >= 0 && age < maxAgeMs
}
