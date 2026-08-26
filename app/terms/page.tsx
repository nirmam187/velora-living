import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import { site } from '@/lib/site'
import { whatsappDisplay } from '@/lib/whatsapp'
import { sizeRange } from '@/data/sizes'

/*
  Written to match how the business actually works today: nothing is bought on
  this website. Every order starts as a conversation, a quote and a confirmation,
  which is why the terms below talk about enquiries and quotations rather than
  carts and checkouts. If a checkout is ever added, this page needs a cancellation
  and refund section written to go with it.

  Plain language, written in good faith, not legal advice.
*/

const UPDATED = '26 August 2026'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms on which you may use the Velora Living website, and how enquiries, quotations and custom rug orders work.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use">
      <p className="legal-updated">Last updated {UPDATED}</p>

      <p>
        These terms cover your use of the Velora Living website. By browsing it or
        sending us an enquiry, you accept them. If you do not, please do not use
        the site.
      </p>

      <h2>Who we are</h2>
      <p>
        Velora Living is a rug studio based in {site.location}. Our rugs are
        handwoven in Bhadohi and Mirzapur and designed in Jaipur. You can reach us
        by email at <a href={`mailto:${site.email}`}>{site.email}</a> or on
        WhatsApp at {whatsappDisplay}.
      </p>

      <h2>This site does not take orders</h2>
      <p>
        There is no cart and no checkout here. Everything on this website is an
        invitation to enquire, not an offer to sell. An order exists only once we
        have quoted you a price for a specific rug in a specific size, and you have
        confirmed it in writing — by WhatsApp, email, or however else we have been
        talking.
      </p>

      <h2>Photographs, colours and sizes</h2>
      <p>
        Every rug on this site is made by hand. That is the point of them, and it
        has consequences worth stating plainly:
      </p>
      <ul>
        <li>
          Colours vary between screens, and between one weaving batch and the next.
          The photographs are honest, but they are a guide, not a colour match.
        </li>
        <li>
          Hand-finished dimensions carry a small tolerance. A rug will be very close
          to the size ordered, not accurate to the millimetre.
        </li>
        <li>
          Some designs are photographed on the warehouse floor rather than styled in
          a room, and no weave or material is claimed for those until we confirm it
          with you.
        </li>
        <li>
          Standard sizes run {sizeRange}. Custom sizes are available on request and
          are quoted individually.
        </li>
      </ul>
      <p>
        If an exact colour matters to your room, ask us for a physical sample before
        you commit. We would far rather send one than have a rug come back.
      </p>

      <h2>Prices and quotations</h2>
      <p>
        No prices are published on this website. We quote per rug, per size, because
        materials, weave and dimensions all move the number. A quotation is valid
        for the period stated in it. Unless we say otherwise in writing, prices
        exclude shipping, duties and any taxes payable where you live.
      </p>

      <h2>Custom and made-to-order rugs</h2>
      <p>
        Most of what we make is woven after you order it. Lead times are quoted at
        the point of order and are estimates given in good faith — handweaving is
        not a machine process and it does not always keep to the day. Because a
        custom rug is made for you specifically, it cannot be cancelled once weaving
        has started, and we will always tell you when that point is coming.
      </p>

      <h2>Using this website</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          copy, scrape or republish our photographs, designs or written copy for
          commercial use — they are ours, and the rug designs are our livelihood
        </li>
        <li>submit false information, or somebody else&rsquo;s details, through our forms</li>
        <li>
          attempt to interfere with the site, its forms, or anything running behind
          them
        </li>
      </ul>

      <h2>Availability</h2>
      <p>
        We try to keep the site up and correct, but we do not guarantee it will
        always be available or entirely free of error. We may change or withdraw any
        part of it, including any design shown, without notice.
      </p>

      <h2>Liability</h2>
      <p>
        Nothing here limits any liability that cannot lawfully be limited — that
        includes liability for death or personal injury caused by negligence, and
        for fraud. Subject to that, we are not liable for indirect or consequential
        losses arising from your use of this website, and our liability in
        connection with any rug is limited to what you paid for it.
      </p>

      <h2>Privacy</h2>
      <p>
        What we do with the information you give us is set out in our{' '}
        <Link href="/privacy-policy">Privacy Policy</Link>, which forms part of
        these terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and the courts of Jaipur,
        Rajasthan have exclusive jurisdiction over any dispute arising from them.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The version that applies to your order is the one
        published when you confirmed it, and the date at the top of this page tells
        you when it last changed.
      </p>

      <p className="legal-back">
        <Link href="/">← Back to Velora Living</Link>
      </p>
    </PageShell>
  )
}
