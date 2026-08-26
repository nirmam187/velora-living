/**
 * Meta Pixel — the browser half of the tracking pair.
 *
 * The base script is injected once by <MetaPixel />; everything else on the site
 * reports events through the helpers here rather than touching `window.fbq`
 * directly, so there is exactly one place that knows the event contract.
 *
 * See lib/meta.ts for the server half and for why both exist.
 */

/** Inlined at build time by Next. Empty until the real Pixel is created in Meta. */
export const metaPixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '').trim()

/** Nothing renders and nothing fires until a Pixel ID is configured. */
export const pixelEnabled = metaPixelId.length > 0

export type MetaEventName = 'PageView' | 'ViewContent' | 'Contact' | 'Lead'

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] }
    _fbq?: unknown
  }
}

/**
 * A fresh id for one event occurrence.
 *
 * The same value must reach both the Pixel call and the Conversions API call, or
 * Meta counts the conversion twice. `randomUUID` needs a secure context, which
 * every real deployment is, but localhost over plain HTTP in an older browser is
 * not — hence the fallback.
 */
export function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Fires a standard event.
 *
 * Silently does nothing when the Pixel is absent — not configured yet, or blocked
 * by an extension. That is the normal case for a chunk of real traffic, and it is
 * exactly why the server sends its own copy.
 */
export function trackPixel(
  event: MetaEventName,
  customData?: Record<string, unknown>,
  eventId?: string,
): void {
  if (!pixelEnabled || typeof window === 'undefined') return
  const fbq = window.fbq
  if (typeof fbq !== 'function') return
  try {
    // Meta's signature: fbq('track', name, custom_data, { eventID }). The key is
    // spelled `eventID` here and `event_id` in the server payload — same value,
    // two different casings, and getting it wrong silently breaks deduplication.
    fbq('track', event, customData ?? {}, eventId ? { eventID: eventId } : undefined)
  } catch (error) {
    console.error('[meta-pixel] failed to fire', event, error)
  }
}

/**
 * Reports that a visitor looked at one rug in detail.
 *
 * Opening the rug viewer is what counts as a view on this site. A card scrolling
 * past in a grid of eighty-nine is not intent; stopping to open one is — and Meta
 * builds its audiences out of exactly that signal.
 *
 * Browser-only: there is no Conversions API copy of ViewContent, because a view
 * is not a conversion and does not need to survive an ad blocker to be useful.
 */
export function trackViewContent(rug: {
  code: string
  label: string
  category: string
}): void {
  trackPixel(
    'ViewContent',
    {
      content_ids: [rug.code],
      content_name: rug.label,
      content_category: rug.category,
      content_type: 'product',
    },
    newEventId(),
  )
}
