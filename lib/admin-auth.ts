import { cookies } from 'next/headers'
import { verifyAdminSession } from './tokens'

export const ADMIN_COOKIE = 'velora_admin'

/** Sessions last a week; after that the password is required again. */
export const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/** True when the current request carries a valid, unexpired admin session. */
export function isAdmin(): boolean {
  const value = cookies().get(ADMIN_COOKIE)?.value
  return verifyAdminSession(value, ADMIN_SESSION_MAX_AGE_MS)
}

/**
 * The configured admin password, or null when none is set.
 * With no ADMIN_PASSWORD the admin area refuses every login rather than falling
 * back to a default — an unguarded /admin would expose every customer's contact
 * details.
 */
export function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD
  return value && value.length > 0 ? value : null
}
