import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import WhatsAppCta from '@/components/WhatsAppCta'
import WhatsAppIcon from '@/components/WhatsAppIcon'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * The 404.
 *
 * Worth building properly rather than leaving as Next's black-on-white default:
 * once ads are running, a retired campaign link or a mistyped URL puts a paying
 * visitor here. They arrived wanting a rug, so this page keeps the brand, offers
 * the two places worth going next, and leaves the chat button within reach.
 */
export default function NotFound() {
  return (
    <PageShell
      title="This page has wandered off"
      intro="The link you followed doesn't lead anywhere on our site — it may have changed, or the address may have a typo in it. Everything is still one click away."
    >
      <div className="nf-actions">
        <Link href="/#collections" className="cta-btn">
          Explore the collections
        </Link>
        <Link href="/#full-range" className="cta-btn line">
          See the full range
        </Link>
        <WhatsAppCta className="cta-btn gold wa-btn">
          <WhatsAppIcon size={17} />
          Chat on WhatsApp
        </WhatsAppCta>
      </div>

      <p className="legal-back">
        <Link href="/">← Back to the home page</Link>
      </p>
    </PageShell>
  )
}
