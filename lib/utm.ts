/**
 * Campaign attribution.
 *
 * When an ad sends someone to the site, the campaign identity is in the URL — and
 * then it is gone, because the first internal link click replaces it. So we read
 * it once on arrival and hold it for the session; whatever the visitor eventually
 * submits carries the ad that produced it.
 *
 * FIRST TOUCH WINS. A stored set is never overwritten by a later, emptier one.
 * Someone who arrives from an ad, wanders off to Instagram and comes back should
 * still be credited to the ad, not to the referral that happened to be last.
 */

/** The keys we persist. `term` is rarely used on Meta but costs nothing to keep. */
export const utmKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export type UtmKey = (typeof utmKeys)[number]

export interface Attribution extends Partial<Record<UtmKey, string>> {
  /** Meta's click identifier, present on every click-through from an ad. */
  fbclid?: string
  /** Where the visitor came from, when the browser tells us. */
  referrer?: string
  /** The first page of the session — which creative pointed at which section. */
  landingPage?: string
}

const STORAGE_KEY = 'velora:attribution'

/** Long enough for anything real, short enough that nobody can bloat a DB row. */
const MAX_LENGTH = 200

function clean(value: string | null): string | undefined {
  if (!value) return undefined
  const tidy = value.trim().slice(0, MAX_LENGTH)
  return tidy.length > 0 ? tidy : undefined
}

/**
 * Reads the current URL and stores what it finds, unless something is already
 * stored. Call once, on load. Safe to call again — it is idempotent.
 *
 * sessionStorage rather than localStorage: attribution should describe *this*
 * visit. A campaign remembered for months would keep crediting an ad the visitor
 * saw in the spring for an enquiry they sent in the autumn.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {}

  const existing = readAttribution()
  if (Object.keys(existing).length > 0) return existing

  const params = new URLSearchParams(window.location.search)
  const found: Attribution = {}

  for (const key of utmKeys) {
    const value = clean(params.get(key))
    if (value) found[key] = value
  }

  const fbclid = clean(params.get('fbclid'))
  if (fbclid) found.fbclid = fbclid

  // Only worth recording if there is a campaign or a click id to attach it to —
  // storing referrer alone would mark every organic session as "attributed".
  if (Object.keys(found).length === 0) return {}

  const referrer = clean(document.referrer)
  if (referrer) found.referrer = referrer
  found.landingPage = `${window.location.pathname}${window.location.search}`.slice(
    0,
    MAX_LENGTH,
  )

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  } catch {
    // Private browsing, or storage disabled. The attribution is simply lost for
    // this visit; nothing else should care.
  }
  return found
}

/** Whatever was captured on arrival. `{}` when this visit came from nowhere in particular. */
export function readAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Attribution
  } catch {
    return {}
  }
}
