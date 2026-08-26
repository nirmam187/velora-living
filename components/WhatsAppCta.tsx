'use client'

import type { CSSProperties, ReactNode } from 'react'
import { generalMessage, whatsappLink } from '@/lib/whatsapp'
import { newEventId, trackPixel } from '@/lib/meta-pixel'

interface WhatsAppCtaProps {
  /** Pre-filled text. Defaults to the general opener. */
  message?: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  /** Rug code, when this CTA belongs to a specific rug. Reported as content_ids. */
  contentId?: string
  contentName?: string
  contentCategory?: string
  'aria-label'?: string
}

/**
 * The site's primary call to action: a link that opens WhatsApp with a message
 * already written, and reports a `Contact` conversion as it goes.
 *
 * It is an <a>, not a button with a redirect. That matters more than it looks:
 * a real link can be middle-clicked, long-pressed, opened in a new tab, and is
 * followed even if this component's JavaScript never hydrates. The tracking is
 * strictly additive — if `onClick` never runs, the visitor still reaches WhatsApp.
 */
export default function WhatsAppCta({
  message = generalMessage,
  className,
  style,
  children,
  contentId,
  contentName,
  contentCategory,
  'aria-label': ariaLabel,
}: WhatsAppCtaProps) {
  function handleClick() {
    // One id, both halves. See lib/meta.ts for why deduplication matters.
    const eventId = newEventId()

    const custom: Record<string, unknown> = {}
    if (contentId) custom.content_ids = [contentId]
    if (contentName) custom.content_name = contentName
    if (contentCategory) custom.content_category = contentCategory

    trackPixel('Contact', custom, eventId)

    const body = JSON.stringify({
      eventId,
      contentId,
      contentName,
      contentCategory,
      sourceUrl: window.location.href,
    })

    // sendBeacon is built for exactly this: a request that must survive the page
    // going away underneath it. The browser hands it to the OS and stops caring
    // about the tab. `fetch` with keepalive is the fallback for the few browsers
    // that refuse a Blob beacon.
    try {
      const blob = new Blob([body], { type: 'application/json' })
      if (!navigator.sendBeacon?.('/api/track/whatsapp-click', blob)) {
        throw new Error('beacon refused')
      }
    } catch {
      void fetch('/api/track/whatsapp-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // A lost tracking call is not worth telling the customer about.
      })
    }
  }

  return (
    <a
      href={whatsappLink(message)}
      className={className}
      style={style}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
