import { NextResponse } from 'next/server'
import { metaCookies, sendMetaEvent } from '@/lib/meta'
import { clientIp, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Server-side `Contact`, fired when a visitor opens WhatsApp.
 *
 * The browser Pixel reports the same click with the same `eventId`; Meta keeps
 * whichever copy arrives and discards the duplicate. This route is the one that
 * survives ad blockers and iOS, which is most of the reason it exists.
 *
 * The click itself is the conversion — for a click-to-WhatsApp campaign there is
 * no later form submission to fall back on, so losing it costs the ad account the
 * signal it optimises against.
 */

/** Generous: a person may legitimately click through from several rugs in a row. */
const LIMIT = 30
const WINDOW_MS = 5 * 60 * 1000

export async function POST(request: Request) {
  const ip = clientIp(request.headers)

  // Purely an abuse ceiling. A blocked call is answered 204 like any other,
  // because there is no user-facing behaviour to report back to.
  if (!rateLimit(`wa-click:${ip}`, LIMIT, WINDOW_MS).ok) {
    return new NextResponse(null, { status: 204 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const str = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() ? value.trim().slice(0, 200) : undefined

  const eventId = str(body.eventId)
  // Without the shared id there is no deduplication, and sending anyway would
  // double-count every click made in a browser where the Pixel did load.
  if (!eventId) return new NextResponse(null, { status: 204 })

  const custom: Record<string, unknown> = {}
  const contentId = str(body.contentId)
  if (contentId) custom.content_ids = [contentId]
  const contentName = str(body.contentName)
  if (contentName) custom.content_name = contentName
  const contentCategory = str(body.contentCategory)
  if (contentCategory) custom.content_category = contentCategory

  const { fbp, fbc } = metaCookies(request.headers)

  await sendMetaEvent({
    eventName: 'Contact',
    eventId,
    sourceUrl: str(body.sourceUrl) ?? request.headers.get('referer'),
    user: {
      ip,
      userAgent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
      fbp,
      fbc,
    },
    customData: Object.keys(custom).length > 0 ? custom : undefined,
  })

  // Nothing to say back. 204 keeps the response out of the browser's way while
  // the tab is already opening WhatsApp.
  return new NextResponse(null, { status: 204 })
}
