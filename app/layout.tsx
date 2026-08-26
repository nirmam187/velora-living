import type { Metadata, Viewport } from 'next'
import { Fraunces, Jost } from 'next/font/google'
import Attribution from '@/components/Attribution'
import MetaPixel from '@/components/MetaPixel'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import { site, siteUrl } from '@/lib/site'
import './globals.css'

/**
 * Fonts are self-hosted by next/font at build time — same families and weights the
 * original loaded from Google Fonts, but with no render-blocking request to a third
 * party and no layout shift when they arrive.
 */
// Both are variable fonts. Omitting `weight` loads the variable axis rather than a
// set of static instances, which covers every weight the design uses (300–600) in
// one smaller file. `opsz` is Fraunces' optical-size axis — the original requested
// it too, and it is what keeps the display serif from looking spindly at large sizes.
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-fraunces',
})

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'handwoven rugs',
    'hand tufted rugs',
    'Bhadohi rugs',
    'Mirzapur carpets',
    'Jaipur rug design',
    'Indian rugs',
    'custom size rugs',
    'wool rugs India',
    'Velora Living',
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl(),
    siteName: site.name,
    title: site.title,
    description: site.description,
    /*
      1200 x 630 — Facebook, Instagram, WhatsApp and X all crop link previews to
      1.91:1, and this is that ratio exactly, so nothing important gets cut.

      The hero photograph used to be here. It is 752 x 1093, and a portrait image
      in a landscape frame renders as a small square thumbnail beside the text
      rather than the full-width card an ad or a shared link deserves. This file
      is a landscape crop of the Afreen room shot, made for this purpose.
    */
    images: [
      {
        url: '/images/og/velora-living-og.jpg',
        width: 1200,
        height: 630,
        alt: 'A Velora Living hand-tufted rug in blue and gold, styled in a living room with a leather chesterfield',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/images/og/velora-living-og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  // Icons are picked up automatically from app/icon.svg, app/favicon.ico and
  // app/apple-icon.png — all three are cropped from the Velora Living monogram.
  category: 'Home & Interior',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F0E6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jost.variable}`}>
      {/*
        All three live in the layout rather than the home page, so they cover the
        legal pages and the 404 as well. Ad traffic does land on those — a Meta
        reviewer opens the privacy policy directly, and a stale ad URL lands on the
        404 with a visitor who is still worth talking to.
      */}
      <body>
        <Attribution />
        {children}
        <WhatsAppFloat />
        <MetaPixel />
      </body>
    </html>
  )
}
