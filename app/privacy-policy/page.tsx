import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import { site } from '@/lib/site'
import { whatsappDisplay } from '@/lib/whatsapp'

/*
  This describes what the site ACTUALLY does — every collection point below maps
  to real code: the enquiry route, the newsletter route, lib/meta.ts, lib/utm.ts,
  lib/email.ts. If any of those change, this page has to change with them, or it
  becomes the kind of privacy policy that is worse than none at all.

  It is written in plain language and in good faith, not by a lawyer. Meta will
  accept it for ad review; that is not the same as it being legal advice. Have
  someone qualified read it before the business grows into anything more
  complicated than an enquiry form.
*/

const UPDATED = '26 August 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Velora Living collects, uses and protects the information you share with us — enquiries, newsletter sign-ups, and website analytics.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p className="legal-updated">Last updated {UPDATED}</p>

      <p>
        Velora Living (&ldquo;we&rdquo;, &ldquo;us&rdquo;) sells handwoven rugs from{' '}
        {site.location}. This page explains what we collect when you use this
        website, why we collect it, and what we do with it. We have tried to write
        it in plain language rather than legal boilerplate.
      </p>
      <p>
        <strong>We do not sell your personal data to anyone, ever.</strong>
      </p>

      <h2>What we collect</h2>

      <h3>When you send an enquiry</h3>
      <p>The enquiry form asks for, and stores:</p>
      <ul>
        <li>your name and email address</li>
        <li>your phone number, if you choose to give one — it is optional</li>
        <li>your message, and the rug code you were looking at</li>
      </ul>
      <p>
        Alongside that we record your IP address and browser user-agent string. We
        use these only to rate-limit the form against automated abuse and to work
        out where a spam submission came from.
      </p>

      <h3>When you subscribe to the newsletter</h3>
      <p>
        Your email address and IP address. Every newsletter carries an unsubscribe
        link, and unsubscribing takes effect immediately.
      </p>

      <h3>When you message us on WhatsApp</h3>
      <p>
        The chat buttons on this site open WhatsApp with a message already written
        for you. Nothing is sent until you press send in WhatsApp itself. Once you
        do, the conversation is between you and us on WhatsApp&rsquo;s platform and
        is governed by WhatsApp&rsquo;s own privacy policy as well as this one. We
        keep those conversations so we can pick up where we left off.
      </p>

      <h3>Advertising and measurement</h3>
      <p>
        We advertise on Facebook and Instagram, and we need to know which ads
        actually lead to conversations. To do that we use the Meta Pixel in your
        browser together with Meta&rsquo;s Conversions API on our server. Between
        them they tell Meta when someone:
      </p>
      <ul>
        <li>opens this website</li>
        <li>looks at a particular rug in detail</li>
        <li>starts a WhatsApp conversation with us</li>
        <li>successfully sends an enquiry</li>
      </ul>
      <p>
        Where you have given us an email address or phone number, our server sends
        it to Meta <strong>hashed</strong> — converted into an irreversible string
        of characters — so that Meta can match the conversion to an ad without ever
        receiving the address itself. Your IP address, browser user-agent and
        Meta&rsquo;s own cookie identifiers are also sent, which is how the match is
        made accurate. Meta uses this data under{' '}
        <a
          href="https://www.facebook.com/privacy/policy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          its own privacy policy
        </a>
        .
      </p>
      <p>
        If you arrived from an advertisement, the campaign identifiers in the link
        you clicked (the <code>utm_</code> parameters and Meta&rsquo;s{' '}
        <code>fbclid</code>) are kept for the length of your visit and stored with
        your enquiry if you send one. That is how we tell which advertisement
        produced which customer.
      </p>

      <h3>Cookies and browser storage</h3>
      <p>This site uses very few:</p>
      <ul>
        <li>
          <strong>Meta Pixel cookies</strong> (<code>_fbp</code>,{' '}
          <code>_fbc</code>) — set by the Pixel to recognise your browser between
          visits and to link a visit back to the advertisement you clicked.
        </li>
        <li>
          <strong>Session storage</strong> — holds the campaign identifiers
          described above. It is cleared by your browser when you close the tab.
        </li>
        <li>
          <strong>An admin session cookie</strong> — only ever set if you log into
          the studio&rsquo;s own admin area. It is strictly necessary and is not
          used for tracking.
        </li>
      </ul>
      <p>
        We do not run Google Analytics, advertising networks other than Meta, or
        any third-party embed that would set cookies of its own.
      </p>

      <h2>Who else sees your data</h2>
      <p>
        Only the services we need to run the business. Each of them acts on our
        instructions:
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> — hosts this website and its database.
        </li>
        <li>
          <strong>Resend</strong> — delivers the confirmation email to you and the
          notification email to us.
        </li>
        <li>
          <strong>Meta Platforms</strong> — receives the advertising measurement
          data described above.
        </li>
        <li>
          <strong>WhatsApp</strong> (also Meta) — carries any conversation you
          start with us.
        </li>
      </ul>
      <p>
        We will also disclose information if the law requires it. Nothing else, and
        nobody buys anything from us.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries are kept while there is any reasonable prospect of an order or a
        follow-up, and for our own accounting records afterwards. Newsletter
        subscriptions are kept until you unsubscribe; after that we retain your
        address on a suppression list, purely so we do not accidentally email you
        again. Ask us to delete any of it and we will.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>See it, correct it, or have it deleted.</strong> Email us and we
          will do it — no forms, no conditions.
        </li>
        <li>
          <strong>Unsubscribe</strong> from the newsletter using the link in any
          email we send.
        </li>
        <li>
          <strong>Opt out of ad tracking</strong> in your Meta{' '}
          <a
            href="https://accountscenter.facebook.com/ad_preferences"
            target="_blank"
            rel="noopener noreferrer"
          >
            ad preferences
          </a>
          , or by using a browser that blocks tracking scripts. The site works
          exactly the same either way.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        This site is meant for adults buying rugs. We do not knowingly collect
        information from anyone under 18.
      </p>

      <h2>Security</h2>
      <p>
        Everything is served over HTTPS, and the database is not publicly
        reachable. No system is perfect, and we will not pretend otherwise — but we
        collect as little as we can get away with, which is the most effective
        protection there is.
      </p>

      <h2>Changes</h2>
      <p>
        If we change what we collect, we change this page and update the date at
        the top of it.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions, corrections or deletion requests — whichever is easiest for you:
      </p>
      <ul>
        <li>
          Email <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        <li>WhatsApp {whatsappDisplay}</li>
        <li>
          Instagram{' '}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            {site.instagramHandle}
          </a>
        </li>
      </ul>

      <p className="legal-back">
        <Link href="/">← Back to Velora Living</Link>
      </p>
    </PageShell>
  )
}
