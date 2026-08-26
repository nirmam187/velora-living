/**
 * Meta Conversions API — the server half of the tracking pair.
 *
 * WHY BOTH HALVES. The browser Pixel alone loses a large share of conversions:
 * iOS App Tracking Transparency, Safari's ITP, and any ad blocker will stop
 * `fbevents.js` from ever loading or firing. The Conversions API sends the same
 * event from our server, where none of that applies. Meta then reconciles the two
 * copies using a shared `event_id` — see `dedupe` below — so a conversion that
 * arrives twice is counted once, and one that arrives only server-side is still
 * counted. Running only the Pixel typically under-reports; running only the API
 * loses the browser signals (fbp/fbc) that make matching accurate.
 *
 * NOTHING HERE THROWS. Tracking is never allowed to fail a customer action: if
 * Meta is down, or the token is missing, an enquiry must still be saved and
 * answered. Every failure is logged and swallowed.
 *
 * Setup — where each value comes from — is documented in the README under
 * "Meta ads tracking".
 */

import { createHash } from 'node:crypto'

/**
 * Graph API version. Meta supports each version for about two years; pinning it
 * means a new version can never silently change the payload contract underneath
 * us. Bump deliberately, after reading the changelog.
 */
const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0'

/** Shared with the browser Pixel — same ID, both halves. */
export const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ''

const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim() || ''

/**
 * Set while testing so events show up in Events Manager → Test Events. MUST be
 * unset in production: events carrying a test code are not counted towards ad
 * optimisation.
 */
const testEventCode = process.env.META_TEST_EVENT_CODE?.trim() || ''

/** The API half is only live when it has both an ID and a token. */
export const capiEnabled = Boolean(metaPixelId && accessToken)

/** The standard events this site sends. Meta matches on the exact spelling. */
export type MetaEventName = 'PageView' | 'ViewContent' | 'Contact' | 'Lead'

/** Meta requires PII to arrive as lowercase, trimmed, SHA-256 hex. Never plaintext. */
function hash(value: string | null | undefined): string | undefined {
  const tidy = value?.trim().toLowerCase()
  if (!tidy) return undefined
  return createHash('sha256').update(tidy).digest('hex')
}

/**
 * Phone numbers must be digits only, including country code, before hashing —
 * "+91 98795 35039" and "919879535039" have to hash identically or the match
 * fails. An Indian 10-digit number with no country code gets 91 prefixed, which
 * is what visitors type into the form.
 */
function hashPhone(value: string | null | undefined): string | undefined {
  const digits = value?.replace(/\D/g, '')
  if (!digits) return undefined
  const full = digits.length === 10 ? `91${digits}` : digits.replace(/^0+/, '')
  return full ? createHash('sha256').update(full).digest('hex') : undefined
}

export interface UserSignals {
  email?: string | null
  phone?: string | null
  /** Best-effort client IP. Meta uses it for matching and geo attribution. */
  ip?: string | null
  userAgent?: string | null
  /** Meta's own first-party cookies, set by the browser Pixel. */
  fbp?: string | null
  fbc?: string | null
}

export interface CapiEvent {
  eventName: MetaEventName
  /**
   * The SAME id the browser Pixel used for this event. This is the whole
   * deduplication mechanism — omit it and Meta counts the conversion twice.
   */
  eventId: string
  /** The page the visitor was on. Meta rejects events with a malformed URL. */
  sourceUrl?: string | null
  user: UserSignals
  /** Standard Meta parameters: content_ids, content_name, content_category… */
  customData?: Record<string, unknown>
}

/**
 * Reads Meta's `_fbp` / `_fbc` cookies off an incoming request.
 *
 * These are first-party cookies the browser Pixel writes; forwarding them with the
 * server event is the single biggest lever on match quality, because they identify
 * the exact browser and the exact ad click. `_fbc` only exists once someone has
 * arrived on an `fbclid` link, so it is routinely absent for organic visitors.
 */
export function metaCookies(headers: Headers): { fbp?: string; fbc?: string } {
  const raw = headers.get('cookie')
  if (!raw) return {}
  const out: { fbp?: string; fbc?: string } = {}
  for (const part of raw.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key === '_fbp') out.fbp = value
    else if (key === '_fbc') out.fbc = value
  }
  return out
}

/**
 * Sends one event. Returns whether Meta accepted it, and never throws.
 *
 * Awaiting this adds a round trip to Meta (typically well under a second) to
 * whatever request calls it. That is deliberate for `Lead`: serverless functions
 * can be frozen the moment a response is returned, so a fire-and-forget promise
 * would often be killed mid-flight and the conversion lost.
 */
export async function sendMetaEvent(event: CapiEvent): Promise<boolean> {
  if (!capiEnabled) return false

  const { user } = event

  // Meta rejects a user_data object whose every field is absent, so drop the
  // undefined keys rather than sending nulls.
  const userData: Record<string, unknown> = {}
  const em = hash(user.email)
  const ph = hashPhone(user.phone)
  if (em) userData.em = [em]
  if (ph) userData.ph = [ph]
  if (user.ip) userData.client_ip_address = user.ip
  if (user.userAgent) userData.client_user_agent = user.userAgent
  if (user.fbp) userData.fbp = user.fbp
  if (user.fbc) userData.fbc = user.fbc

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        // Seconds, not milliseconds. Meta silently drops events more than seven
        // days old, and a millisecond timestamp reads as far in the future.
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: 'website',
        ...(event.sourceUrl ? { event_source_url: event.sourceUrl } : {}),
        user_data: userData,
        ...(event.customData ? { custom_data: event.customData } : {}),
      },
    ],
  }
  if (testEventCode) payload.test_event_code = testEventCode

  const url = `https://graph.facebook.com/${API_VERSION}/${metaPixelId}/events?access_token=${encodeURIComponent(accessToken)}`

  try {
    // Capped so a slow or unreachable Graph API cannot hold a customer's enquiry
    // open indefinitely.
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    })

    if (!response.ok) {
      // The body carries Meta's actual complaint (bad token, wrong pixel, malformed
      // field). Without it, debugging is guesswork.
      const detail = await response.text().catch(() => '')
      console.error(
        `[meta] ${event.eventName} rejected (${response.status}): ${detail.slice(0, 500)}`,
      )
      return false
    }
    return true
  } catch (error) {
    console.error(`[meta] ${event.eventName} failed to send:`, error)
    return false
  }
}
