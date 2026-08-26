'use client'

import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'
import { generalMessage } from '@/lib/whatsapp'

/**
 * The persistent chat button, bottom-right on every page.
 *
 * Standard for ad-driven traffic, and it earns its place: a visitor three
 * screens into the full range should never have to scroll anywhere to start a
 * conversation. It is styled in the brand's gold and ink rather than WhatsApp's
 * green — the mark is recognisable enough on its own, and green would be the
 * loudest thing on a page built from cream and wool tones.
 *
 * <BackToTop /> shares this corner and is offset upwards in CSS to sit above it.
 */
export default function WhatsAppFloat() {
  return (
    <WhatsAppCta
      className="wa-float"
      message={generalMessage}
      /* Starts with the visible label, so it satisfies WCAG 2.5.3 (Label in Name):
         a speech-input user who says "chat with us" must activate this control. */
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon size={28} />
      {/* Widens into a label on pointer devices; the icon alone on phones, where
          screen width is the scarcest thing on the page. */}
      <span className="wa-float-label">Chat with us</span>
    </WhatsAppCta>
  )
}
