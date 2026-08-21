import type { Metadata, Viewport } from 'next'
import { Fraunces, Jost } from 'next/font/google'
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
    images: [
      {
        url: '/images/hero/bold-floral-living-room.jpg',
        width: 752,
        height: 1093,
        alt: 'Velora Living bold floral hand-tufted rug styled in a living room',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/images/hero/bold-floral-living-room.jpg'],
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
      <body>{children}</body>
    </html>
  )
}
