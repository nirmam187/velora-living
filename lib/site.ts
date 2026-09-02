/** Site-wide constants. Anything environment-specific reads from env with a sane default. */

export const site = {
  name: 'Velora Living',
  tagline: 'Where heritage meets home',
  title:
    'Velora Living — Handwoven Rugs from Bhadohi & Mirzapur, Designed in Jaipur',
  description:
    "Handcrafted rugs from India's carpet-weaving capital, brought into modern homes — rooted in Bhadohi & Mirzapur artistry, designed in Jaipur. Sixteen designs, nine standard sizes, custom sizes on every rug.",
  instagram: 'https://www.instagram.com/theveloraliving',
  instagramHandle: '@theveloraliving',
  email: 'parikhnirmam@gmail.com',
  location: 'Jaipur, Rajasthan, India',
} as const

/**
 * Canonical origin, no trailing slash.
 * Locally this is http://localhost:3000; on Vercel, set NEXT_PUBLIC_SITE_URL to the
 * production domain. VERCEL_URL is the per-deployment fallback for preview builds.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/**
 * An absolute URL for a path, safe to call in the browser.
 *
 * `siteUrl()` reads VERCEL_URL, which is a server-only variable — calling it in a
 * client component returns localhost in production and silently breaks the WhatsApp
 * preview, since WhatsApp fetches the link from its own servers and cannot reach a
 * localhost address. So this prefers the public variable, and otherwise asks the
 * browser where it actually is, which is right by definition.
 */
export function publicUrl(path: string): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  const origin =
    explicit?.replace(/\/$/, '') ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${origin}${path}`
}
