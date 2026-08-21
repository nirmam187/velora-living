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
